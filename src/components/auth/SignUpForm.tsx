'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { signUpSchema } from '@/schemas/auth';

interface SignUpFormProps {
  redirectTo?: string;
}

export default function SignUpForm({ redirectTo = '/dashboard' }: SignUpFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedData = signUpSchema.safeParse({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    if (!parsedData.success) {
      const fieldErrors = parsedData.error.flatten().fieldErrors;
      const nextErrors: Record<string, string> = {};

      if (fieldErrors.name?.[0]) nextErrors.name = fieldErrors.name[0];
      if (fieldErrors.email?.[0]) nextErrors.email = fieldErrors.email[0];
      if (fieldErrors.password?.[0]) nextErrors.password = fieldErrors.password[0];

      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData.data),
      });

      let data: { error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const message = data?.error || 'Failed to create account';
        setErrors({ form: message });
        showToast(message, 'error');
      } else {
        showToast('Account created successfully', 'success');
        startTransition(() => {
          const nextHref =
            redirectTo === '/dashboard'
              ? '/sign-in'
              : `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`;
          router.push(nextHref);
        });
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="John Doe"
        required
      />

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
        minLength={6}
        required
      />

      {errors.form && (
        <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Create Account
      </Button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{' '}
        <Link
          href={redirectTo === '/dashboard' ? '/sign-in' : `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="text-zinc-900 dark:text-white font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
