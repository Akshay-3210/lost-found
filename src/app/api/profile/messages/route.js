import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import UserMessage from '@/model/UserMessage';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const messages = await UserMessage.find({ recipientId: session.user.id })
      .select('senderName senderEmail message createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get profile messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
