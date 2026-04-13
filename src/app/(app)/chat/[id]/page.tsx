import { Metadata } from 'next';
import Link from 'next/link';
import mongoose from 'mongoose';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import UserMessage from '@/model/UserMessage';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConversationThread from '@/components/users/ConversationThread';
import UserMessageForm from '@/components/users/UserMessageForm';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

function initialsFromName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { title: 'Chat - Lost & Found' };
  }

  await dbConnect();
  const user = await User.findById(id).select('name email').lean();

  return {
    title: `Chat with ${user?.name || user?.email || 'User'} - Lost & Found`,
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'user') {
    redirect('/sign-in');
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  if (session.user.id === id) {
    redirect('/profile');
  }

  await dbConnect();

  const user = await User.findById(id)
    .select('name email image location bio')
    .lean();

  if (!user) {
    notFound();
  }

  const messages = await UserMessage.find({
    $or: [
      { senderId: session.user.id, recipientId: id },
      { senderId: id, recipientId: session.user.id },
    ],
  })
    .select('senderId recipientId senderName senderEmail message createdAt')
    .sort({ createdAt: 1 })
    .lean();

  const initials = initialsFromName(user.name, user.email);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Chat</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Track your conversation history and send new messages here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href={`/users/${id}`}>Back to Profile</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">My Profile</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-xl font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name || user.email} className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                    {user.name || 'Lost & Found User'}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {user.location || 'Location not shared'}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {user.bio || 'This user has not added a bio yet.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Conversation</h2>
              </CardHeader>
              <CardContent>
                <ConversationThread
                  currentUserId={session.user.id}
                  messages={messages.map((message) => ({
                    _id: message._id.toString(),
                    senderId: message.senderId.toString(),
                    senderName: message.senderName,
                    senderEmail: message.senderEmail,
                    recipientId: message.recipientId.toString(),
                    message: message.message,
                    createdAt: message.createdAt.toISOString(),
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Send Message</h2>
              </CardHeader>
              <CardContent>
                <UserMessageForm recipientId={id} recipientName={user.name || user.email} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
