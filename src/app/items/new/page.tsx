import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ItemForm from '@/components/items/ItemForm';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Report Item - Lost & Found',
  description: 'Report a lost or found item',
};

export default async function NewItemPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-4">
            Report an Item
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Fill in the details about the lost or found item
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <ToastProvider>
            <ItemForm />
          </ToastProvider>
        </div>
      </div>
    </div>
  );
}
