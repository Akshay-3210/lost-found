'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import HomeProfileSection from '@/components/profile/HomeProfileSection';
import Button from '@/components/ui/Button';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || (pathname.startsWith('/sign-') ? null : pathname);
  const signInHref = redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}` : '/sign-in';
  const signUpHref = redirectTo ? `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}` : '/sign-up';

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold leading-none text-zinc-900 dark:text-white">
              Lost & Found
            </Link>
            {pathname === '/' && session?.user?.role === 'user' && <HomeProfileSection />}
          </div>

          <nav className="flex items-center gap-7">
            <Link href="/" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Home
            </Link>
            <Link href="/users" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Other Users
            </Link>
            {session ? (
              <>
                <Link
                  href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  {session.user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
                {session.user.role === 'admin' && (
                  <Link href="/admin/user-view" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    User View
                  </Link>
                )}
                <Link href="/items/new" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  Report Item
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href={signInHref} className="text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  Sign In
                </Link>
                <Button size="sm" asChild>
                  <Link href={signUpHref}>Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
