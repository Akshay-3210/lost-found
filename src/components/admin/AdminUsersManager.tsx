'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

function initialsFromName(name?: string) {
  const source = name?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default function AdminUsersManager() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch users');
        }

        setUsers(data.users || []);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to fetch users', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [showToast]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Remove this user from Atlas? Their items and messages will also be deleted.')) {
      return;
    }

    setBusyUserId(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove user');
      }

      setUsers((current) => current.filter((user) => user._id !== userId));
      showToast('User removed successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to remove user', 'error');
    } finally {
      setBusyUserId(null);
    }
  };

  if (isLoading) {
    return <p className="text-zinc-600 dark:text-zinc-400">Loading users...</p>;
  }

  if (users.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No user profiles found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total profiles</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40">
          <p className="text-sm text-sky-700 dark:text-sky-300">With profile photo</p>
          <p className="mt-2 text-3xl font-bold text-sky-900 dark:text-sky-100">
            {users.filter((user) => !!user.image).length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">With bio</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            {users.filter((user) => !!user.bio).length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        Click `Remove` on any profile card to delete that user from Atlas. Their items and user messages are removed too.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <div
            key={user._id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-base font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || user.email} className="h-full w-full object-cover" />
                ) : (
                  <span>{initialsFromName(user.name || user.email)}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
                  {user.name || 'Unnamed User'}
                </h2>
                <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <p>Phone: {user.phone || 'Not provided'}</p>
              <p>Location: {user.location || 'Not provided'}</p>
              <p className="line-clamp-3">Bio: {user.bio || 'Not provided'}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href={`/users/${user._id}`}>Open Public Profile</Link>
              </Button>
              <Button
                variant="danger"
                isLoading={busyUserId === user._id}
                onClick={() => handleDelete(user._id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
