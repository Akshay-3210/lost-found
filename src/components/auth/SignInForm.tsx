'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { signInSchema } from '@/schemas/auth';

const ADMIN_EMAIL = 'root@gmail.com';

function getAuthErrorMessage(error: string | null) {
  switch (error) {
    case 'AccessDenied':
      return 'Google sign-in was denied. Please try again or use email and password.';
    case 'OAuthAccountNotLinked':
      return 'This email is already linked to a different sign-in method.';
    case 'Configuration':
      return 'Google sign-in is not configured correctly yet.';
    case 'Verification':
      return 'The sign-in request expired or is no longer valid.';
    default:
      return error ? 'Sign-in failed. Please try again.' : '';
  }
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const oauthError = searchParams.get('error');
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const [errors, setErrors] = useState<Record<string, string>>(
    oauthError ? { form: getAuthErrorMessage(oauthError) } : {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedData = signInSchema.safeParse({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    if (!parsedData.success) {
      const fieldErrors = parsedData.error.flatten().fieldErrors;
      const nextErrors: Record<string, string> = {};

      if (fieldErrors.email?.[0]) nextErrors.email = fieldErrors.email[0];
      if (fieldErrors.password?.[0]) nextErrors.password = fieldErrors.password[0];

      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const destination = parsedData.data.email === ADMIN_EMAIL ? '/admin' : redirectTo;
      const result = await signIn('credentials', {
        email: parsedData.data.email,
        password: parsedData.data.password,
        redirect: false,
        redirectTo: destination,
      });

      if (result?.error) {
        setErrors({ form: result.error });
        showToast(result.error, 'error');
      } else {
        showToast('Signed in successfully', 'success');
        router.push(destination);
        router.refresh();
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
        placeholder="********"
        required
      />

      {errors.form && (
        <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign In
      </Button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link
          href={redirectTo === '/dashboard' ? '/sign-up' : `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="text-zinc-900 dark:text-white font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
