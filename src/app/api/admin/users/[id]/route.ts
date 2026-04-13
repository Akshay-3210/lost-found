import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import Item from '@/model/Item';
import User from '@/model/User';
import UserMessage from '@/model/UserMessage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id).select('_id email');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await Promise.all([
      Item.deleteMany({ userId: id }),
      Item.updateMany(
        { claimedBy: id },
        {
          $unset: {
            claimedBy: 1,
          },
          $set: {
            status: 'active',
          },
        }
      ),
      UserMessage.deleteMany({
        $or: [{ senderId: id }, { recipientId: id }],
      }),
      User.findByIdAndDelete(id),
    ]);

    return NextResponse.json({
      message: `User ${user.email} removed successfully`,
    });
  } catch (error) {
    console.error('Delete admin user error:', error);
    return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
  }
}
