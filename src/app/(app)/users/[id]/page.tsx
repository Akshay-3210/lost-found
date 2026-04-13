import { Metadata } from 'next';
import Link from 'next/link';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

function initialsFromName(name?: string | null) {
  const source = name?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { title: 'User Profile - Lost & Found' };
  }

  await dbConnect();
  const user = await User.findById(id).select('name').lean();

  return {
    title: `${user?.name || 'User'} - Lost & Found`,
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const session = await auth();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await dbConnect();

  const user = await User.findById(id)
    .select('name image location bio createdAt')
    .lean();

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user._id.toString();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">User Profile</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Browse public details and send a message if you are signed in.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/users">Other Users</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-2xl font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <span>{initialsFromName(user.name)}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">
                    {user.name || 'Lost & Found User'}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {user.location || 'Location not shared'}
                  </p>
                  <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                    {user.bio || 'This user has not added a bio yet.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Send Message</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session?.user ? (
                <>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Sign in to send a message to this user.
                  </p>
                  <Button asChild>
                    <Link href={`/sign-in?redirectTo=${encodeURIComponent(`/users/${user._id.toString()}`)}`}>Sign In</Link>
                  </Button>
                </>
              ) : isOwnProfile ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  This is your profile. Use your main profile page to update your own details.
                </p>
              ) : session.user.role === 'admin' ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Admin accounts cannot send user profile messages.
                </p>
              ) : (
                <Button asChild>
                  <Link href={`/chat/${user._id.toString()}`}>Open Chat</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
