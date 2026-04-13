import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { signUpSchema } from '@/schemas/auth';
import { buildVerificationUrl, createEmailVerificationToken } from '@/lib/emailVerification';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = signUpSchema.parse(body);
    const name = parsedBody.name.trim();
    const email = parsedBody.email.trim().toLowerCase();
    const { password } = parsedBody;
    const redirectTo =
      typeof body.redirectTo === 'string' && body.redirectTo.startsWith('/')
        ? body.redirectTo
        : '/dashboard';

    await dbConnect();

    // Emails are normalized to lowercase before storage, so use an exact lookup here.
    const existingUser = await User.findOne({ email });
    const { token, hashedToken, expiresAt } = createEmailVerificationToken();

    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in or use a different email.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user = existingUser;

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.emailVerified = undefined;
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = expiresAt;
      await user.save();
    } else {
      user = await User.create({
        email,
        name,
        password: hashedPassword,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expiresAt,
      });
    }

    await sendVerificationEmail({
      email,
      name,
      verificationUrl: buildVerificationUrl(token, email, redirectTo),
    });

    return NextResponse.json(
      {
        message: 'Account created. Please verify your email before signing in.',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { error: 'Database error while creating account. Please try again.' },
        { status: 500 }
      );
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: 'User already exists. Please sign in.' },
        { status: 400 }
      );
    }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create account' },
        { status: 500 }
      );
  }
}
