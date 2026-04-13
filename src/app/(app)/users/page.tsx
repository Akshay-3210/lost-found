import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Other Users - Lost & Found',
  description: 'Browse other Lost & Found users and open their profiles.',
};

function initialsFromName(name?: string | null) {
  const source = name?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default async function UsersPage() {
  const session = await auth();

  await dbConnect();

  const users = await User.find({})
    .select('name image location bio createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const otherUsers = users.filter((user) => user._id.toString() !== session?.user?.id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">Other Users</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Open public profiles and send messages when you are signed in.
            </p>
          </div>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/">Home</Link>
          </Button>
        </div>

        {otherUsers.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-zinc-600 dark:text-zinc-400">No other users are available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {otherUsers.map((user) => (
              <Card key={user._id.toString()} className="overflow-hidden">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-lg font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
                      ) : (
                        <span>{initialsFromName(user.name)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-zinc-900 dark:text-white">
                        {user.name || 'Lost & Found User'}
                      </h2>
                      <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                        {user.location || 'Location not shared'}
                      </p>
                    </div>
                  </div>

                  <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {user.bio || 'No bio added yet.'}
                  </p>

                  <Button asChild>
                    <Link href={`/users/${user._id.toString()}`}>Open Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
