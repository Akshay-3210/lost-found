import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import { profileUpdateSchema } from '@/schemas/auth';
import { z } from 'zod';

function buildProfileUpdate(validatedData: z.infer<typeof profileUpdateSchema>) {
  const name = validatedData.name.trim();
  const phone = validatedData.phone?.trim() || '';
  const location = validatedData.location?.trim() || '';
  const bio = validatedData.bio?.trim() || '';
  const image = validatedData.image?.trim() || '';

  return {
    $set: {
      name,
      phone,
      location,
      bio,
      image,
    },
  };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('email name image phone location bio createdAt updatedAt');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      buildProfileUpdate(validatedData),
      {
        new: true,
        runValidators: true,
      }
    ).select('email name image phone location bio createdAt updatedAt');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const image = typeof body.image === 'string' ? body.image.trim() : '';

    if (image && !z.string().url().safeParse(image).success) {
      return NextResponse.json({ error: 'Profile image must be a valid URL' }, { status: 400 });
    }

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          image,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('email name image phone location bio createdAt updatedAt');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile image updated successfully',
    });
  } catch (error) {
    console.error('Patch profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile image' }, { status: 500 });
  }
}
