import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ProfileForm from '@/components/profile/ProfileForm';
import ReceivedMessages from '@/components/users/ReceivedMessages';
import Button from '@/components/ui/Button';
import { dbConnect } from '@/helpers/dbConnect';
import UserMessage from '@/model/UserMessage';

export const metadata: Metadata = {
  title: 'Profile - Lost & Found',
  description: 'Update your Lost & Found profile details and photo.',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  await dbConnect();

  const messages = await UserMessage.find({ recipientId: session.user.id })
    .select('senderId senderName senderEmail message createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Profile</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Update your profile photo and personal details here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">My Items</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <ProfileForm />
          <ReceivedMessages
            messages={messages.map((message) => ({
              _id: message._id.toString(),
              senderId: message.senderId.toString(),
              senderName: message.senderName,
              senderEmail: message.senderEmail,
              message: message.message,
              createdAt: message.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
