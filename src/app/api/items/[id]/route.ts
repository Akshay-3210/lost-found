import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import Item from '@/model/Item';
import { auth } from '@/lib/auth';
import { updateItemSchema } from '@/schemas/item';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await dbConnect();

    const item = await Item.findById(id).populate('userId', 'name email');

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PUT update item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'admin';

    // Check ownership unless the current session is an admin.
    if (!isAdmin && item.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateItemSchema.parse(body);

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
      { new: true }
    );

    return NextResponse.json({
      item: updatedItem,
      message: 'Item updated successfully',
    });
  } catch (error) {
    console.error('Update item error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'admin';

    // Check ownership unless the current session is an admin.
    if (!isAdmin && item.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await Item.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
