import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import Item from '@/model/Item';
import { z } from 'zod';

const adminItemActionSchema = z.object({
  status: z.enum(['active', 'resolved']),
  claimedByName: z.string().max(120, 'Claimed by must be 120 characters or less').optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, claimedByName } = adminItemActionSchema.parse(body);

    await dbConnect();

    const update =
      status === 'resolved'
        ? {
            status,
            claimedByName: claimedByName?.trim() || '',
          }
        : {
            status,
            claimedByName: '',
          };

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      item: updatedItem,
      message: `Item marked as ${status}`,
    });
  } catch (error) {
    console.error('Admin item status update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to update item status' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Admin item delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
