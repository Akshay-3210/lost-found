import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { dbConnect } from '@/helpers/dbConnect';
import ItemModel from '@/model/Item';
import { Item } from '@/types';
import ItemForm from '@/components/items/ItemForm';
import { ToastProvider } from '@/components/ui/Toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const item = await ItemModel.findById(id);

  if (!item) {
    return {
      title: 'Item Not Found - Lost & Found',
    };
  }

  return {
    title: `Edit: ${item.title} - Lost & Found`,
  };
}

export default async function EditItemPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  const { id } = await params;
  await dbConnect();
  const itemDoc = await ItemModel.findById(id);

  if (!itemDoc) {
    notFound();
  }

  // Check ownership
  if (itemDoc.userId.toString() !== session.user.id) {
    redirect(`/items/${id}`);
  }

  // Convert Mongoose document to plain object with string _id
  const item = itemDoc.toObject() as unknown as Item & { _id: string };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href={`/items/${id}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            &larr; Back to Item
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-4">
            Edit Item
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Update the details of your item
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <ToastProvider>
            <ItemForm item={item} isEdit />
          </ToastProvider>
        </div>
      </div>
    </div>
  );
}
