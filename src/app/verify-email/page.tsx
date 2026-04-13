import { Metadata } from 'next';
import Link from 'next/link';
import VerifyEmailCard from '@/components/auth/VerifyEmailCard';

export const metadata: Metadata = {
  title: 'Verify Email - Lost & Found',
  description: 'Verify your Lost & Found email address',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string; redirectTo?: string }>;
}) {
  const { token, email, redirectTo } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-2 inline-block text-2xl font-bold text-zinc-900 dark:text-white">
            Lost & Found
          </Link>
        </div>

        <VerifyEmailCard token={token} email={email} redirectTo={redirectTo || '/dashboard'} />
      </div>
    </div>
  );
}
