import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id)
      .select('name image location bio createdAt')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
