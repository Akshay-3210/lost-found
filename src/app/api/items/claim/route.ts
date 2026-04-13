import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import Item from '@/model/Item';
import { auth } from '@/lib/auth';

// POST claim an item
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.status !== 'active') {
      return NextResponse.json(
        { error: 'Item is no longer available' },
        { status: 400 }
      );
    }

    // Update item status
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        status: 'claimed',
        claimedBy: session.user.id,
      },
      { new: true }
    );

    return NextResponse.json({
      item: updatedItem,
      message: 'Item claimed successfully',
    });
  } catch (error) {
    console.error('Claim item error:', error);
    return NextResponse.json(
      { error: 'Failed to claim item' },
      { status: 500 }
    );
  }
}
