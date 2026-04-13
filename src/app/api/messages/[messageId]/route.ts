import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import UserMessage from '@/model/UserMessage';

interface RouteContext {
  params: Promise<{ messageId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'user') {
      return NextResponse.json({ error: 'Please sign in to delete a message' }, { status: 401 });
    }

    const { messageId } = await params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid message id' }, { status: 400 });
    }

    await dbConnect();

    const deletedMessage = await UserMessage.findOneAndDelete({
      _id: messageId,
      senderId: session.user.id,
    });

    if (!deletedMessage) {
      return NextResponse.json({ error: 'Message not found or cannot be deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
