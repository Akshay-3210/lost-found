import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { dbConnect } from '@/helpers/dbConnect';
import Item from '@/model/Item';
import { formatDate, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ClaimButton from '@/components/items/ClaimButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const item = await Item.findById(id);

  if (!item) {
    return {
      title: 'Item Not Found - Lost & Found',
    };
  }

  return {
    title: `${item.title} - Lost & Found`,
    description: item.description,
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  await dbConnect();
  const item = await Item.findById(id).populate('userId', 'name email');

  if (!item) {
    notFound();
  }

  const session = await auth();
  const user = item.userId as any;
  const isOwner = session?.user?.id === user._id.toString();
  const canClaim = session?.user?.id && session.user.id !== user._id.toString() && item.status === 'active';

  const typeColors = {
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    found: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  const statusColors = {
    active: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    resolved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    claimed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          &larr; Back to Home
        </Link>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    typeColors[item.type]
                  )}
                >
                  {item.type === 'lost' ? 'Lost' : 'Found'}
                </span>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    statusColors[item.status]
                  )}
              >
                {item.status}
              </span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                {item.title}
              </h1>
            </div>
          </div>

          {item.images && item.images.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {item.images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`${item.title} - Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                />
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Description
              </h3>
              <p className="text-zinc-900 dark:text-white">{item.description}</p>
            </div>

            {item.location && (
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Location
                </h3>
                <p className="text-zinc-900 dark:text-white">{item.location}</p>
              </div>
            )}

            {item.date && (
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Date
                </h3>
                <p className="text-zinc-900 dark:text-white">{formatDate(item.date)}</p>
              </div>
            )}

            {item.contactInfo && (
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Contact
                </h3>
                <p className="text-zinc-900 dark:text-white">{item.contactInfo}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Posted by
              </h3>
              <p className="text-zinc-900 dark:text-white">
                {user.name || user.email}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Posted
              </h3>
              <p className="text-zinc-900 dark:text-white">{formatDate(item.createdAt)}</p>
            </div>
          </div>

          {canClaim && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <ClaimButton itemId={item._id.toString()} />
            </div>
          )}

          {isOwner && (
            <div className="mt-8 flex gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/items/${item._id.toString()}/edit`}>Edit Item</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
