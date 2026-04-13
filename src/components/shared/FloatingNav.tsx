'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function FloatingNav() {
  const { data: session } = useSession();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 bg-zinc-900 dark:bg-white rounded-full px-2 py-2 shadow-lg">
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full transition-colors"
        >
          Home
        </Link>
        {session ? (
          <>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/items/new"
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full transition-colors"
            >
              + New Item
            </Link>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            Sign In
          </Link>
        )}
      </nav>
    </div>
  );
}
