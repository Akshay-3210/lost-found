'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || (pathname.startsWith('/sign-') ? null : pathname);
  const signInHref = redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}` : '/sign-in';
  const signUpHref = redirectTo ? `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}` : '/sign-up';

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
            Lost & Found
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  {session.user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
                {session.user.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    User View
                  </Link>
                )}
                <Link
                  href="/items/new"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Report Item
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={signInHref}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Button asChild>
                  <Link href={signUpHref}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
