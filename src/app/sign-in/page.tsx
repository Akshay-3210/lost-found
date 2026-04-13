import { Metadata } from 'next';
import Link from 'next/link';
import SignInForm from '@/components/auth/SignInForm';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Sign In - Lost & Found',
  description: 'Sign in to your Lost & Found account',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo } = await searchParams;
  const destination = redirectTo || '/dashboard';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Lost & Found
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        <ToastProvider>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <SignInForm oauthError={error} redirectTo={destination} />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleSignIn redirectTo={destination} />
              </div>
            </div>
          </div>
        </ToastProvider>
      </div>
    </div>
  );
}
