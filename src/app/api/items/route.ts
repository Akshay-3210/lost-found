import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import Item from '@/model/Item';
import { auth } from '@/lib/auth';
import { createItemSchema } from '@/schemas/item';

// GET all items (public)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const query: Record<string, unknown> = {};

    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = userId;
    }

    const items = await Item.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST new item (requires auth)
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

    const body = await request.json();
    const validatedData = createItemSchema.parse(body);

    const item = await Item.create({
      ...validatedData,
      userId: session.user.id,
      date: validatedData.date ? new Date(validatedData.date) : undefined,
    });

    return NextResponse.json(
      { item, message: 'Item created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create item error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
