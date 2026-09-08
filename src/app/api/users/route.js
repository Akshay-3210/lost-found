import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({})
      .select('name image location bio createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
