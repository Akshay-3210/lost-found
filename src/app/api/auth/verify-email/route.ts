import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import { hashEmailVerificationToken } from '@/lib/emailVerification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!token || !email) {
      return NextResponse.json({ error: 'Verification link is incomplete.' }, { status: 400 });
    }

    await dbConnect();

    const hashedToken = hashEmailVerificationToken(token);
    const user = await User.findOne({
      email,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken');

    if (!user) {
      return NextResponse.json(
        { error: 'This verification link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    user.emailVerified = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
  }
}
