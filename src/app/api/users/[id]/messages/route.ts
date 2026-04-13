import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import UserMessage from '@/model/UserMessage';
import { userMessageSchema } from '@/schemas/user';
import { ZodError } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'user') {
      return NextResponse.json({ error: 'Please sign in to view chat messages' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    if (session.user.id === id) {
      return NextResponse.json({ error: 'Open your profile to manage your own account' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id).select('name image').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const messages = await UserMessage.find({
      $or: [
        { senderId: session.user.id, recipientId: id },
        { senderId: id, recipientId: session.user.id },
      ],
    })
      .select('senderId recipientId senderName senderEmail message createdAt')
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ user, messages });
  } catch (error) {
    console.error('Get user messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'user') {
      return NextResponse.json({ error: 'Please sign in to send a message' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot send a message to yourself' }, { status: 400 });
    }

    const body = await request.json();
    const validatedBody = userMessageSchema.parse(body);

    await dbConnect();

    const recipient = await User.findById(id).select('_id');

    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await UserMessage.create({
      senderId: session.user.id,
      recipientId: id,
      senderName: session.user.name || '',
      senderEmail: session.user.email,
      message: validatedBody.message,
    });

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 201 });
  } catch (error) {
    console.error('Send user message error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
