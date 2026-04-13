'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface VerifyEmailCardProps {
  token?: string;
  email?: string;
  redirectTo?: string;
}

export default function VerifyEmailCard({
  token = '',
  email = '',
  redirectTo = '/dashboard',
}: VerifyEmailCardProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Verification failed.');
        return;
      }

      setStatus('success');
      setMessage(data.message || 'Email verified successfully.');
    } catch {
      setStatus('error');
      setMessage('Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo }),
      });
      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to resend verification email.');
        return;
      }

      setStatus('idle');
      setMessage(data.message || 'Verification email sent.');
    } catch {
      setStatus('error');
      setMessage('Failed to resend verification email.');
    }
  };

  const isMissingParams = !token || !email;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Verify your email</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Confirm your email address to activate your account and sign in.
      </p>

      {message && (
        <p
          className={`mt-4 text-sm ${
            status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-300'
          }`}
        >
          {message}
        </p>
      )}

      {isMissingParams ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          This verification link is incomplete. Please request a new email.
        </p>
      ) : status === 'success' ? (
        <Button asChild className="mt-6 w-full">
          <Link href={redirectTo === '/dashboard' ? '/sign-in' : `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`}>
            Continue to Sign In
          </Link>
        </Button>
      ) : (
        <div className="mt-6 space-y-3">
          <Button type="button" onClick={handleVerify} isLoading={status === 'loading'} className="w-full">
            Confirm Email
          </Button>
          <Button type="button" variant="outline" onClick={handleResend} className="w-full" disabled={!email || status === 'loading'}>
            Send New Link
          </Button>
        </div>
      )}
    </div>
  );
}
