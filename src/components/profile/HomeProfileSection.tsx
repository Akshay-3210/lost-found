'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';

function initialsFromName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default function HomeProfileSection() {
  const { data: session, status } = useSession();
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!session?.user || session.user.role !== 'user') {
      return;
    }

    const fetchBio = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();

        if (!res.ok) {
          return;
        }

        setBio(data.user?.bio || '');
      } catch {
        setBio('');
      }
    };

    fetchBio();
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="w-full max-w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:max-w-sm">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading your profile...</p>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'user') {
    return null;
  }

  const initials = initialsFromName(session.user.name, session.user.email);

  return (
    <div id="profile" className="w-full max-w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:max-w-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
        Signed In
      </p>
      <div className="mt-3 flex items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="group relative">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name || session.user.email} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            {bio && (
              <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-52 rounded-2xl bg-zinc-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-white dark:text-zinc-900">
                {bio}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-white">
              {session.user.name || 'Your profile'}
            </h2>
            <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{session.user.email}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
              Tap or hover photo for bio.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href="/profile">Profile</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/items/new">Report</Link>
        </Button>
      </div>
    </div>
  );
}
