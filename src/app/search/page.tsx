import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import ItemList from '@/components/items/ItemList';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Search - Lost & Found',
  description: 'Search for lost and found items',
};

function SearchContent({ searchParams }: { searchParams: { q?: string; type?: string } }) {
  const query = searchParams.q;
  const type = searchParams.type as 'lost' | 'found' | undefined;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-4">
            Search Results
          </h1>
          {query && (
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Showing results for &quot;{query}&quot;
              {type && ` (${type} items)`}
            </p>
          )}
        </div>

        <ToastProvider>
          <ItemList type={type} status="active" />
        </ToastProvider>
      </div>
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <SearchContent searchParams={searchParams as any} />
    </Suspense>
  );
}
