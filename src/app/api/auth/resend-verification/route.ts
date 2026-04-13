import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import { buildVerificationUrl, createEmailVerificationToken } from '@/lib/emailVerification';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const redirectTo =
      typeof body.redirectTo === 'string' && body.redirectTo.startsWith('/')
        ? body.redirectTo
        : '/dashboard';

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please sign up first.' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'This email is already verified.' });
    }

    const { token, hashedToken, expiresAt } = createEmailVerificationToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = expiresAt;
    await user.save();

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl: buildVerificationUrl(token, user.email, redirectTo),
    });

    return NextResponse.json({ message: 'A new verification email has been sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resend verification email.' },
      { status: 500 }
    );
  }
}
