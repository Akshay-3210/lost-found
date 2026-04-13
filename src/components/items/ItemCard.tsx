'use client';

import Link from 'next/link';
import { Item } from '@/types';
import { timeAgo, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface ItemCardProps {
  item: Item;
  showDelete?: boolean;
  onDelete?: (itemId: string) => void;
}

export default function ItemCard({ item, showDelete = false, onDelete }: ItemCardProps) {
  const { showToast } = useToast();

  const typeColors = {
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    found: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  const statusColors = {
    active: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    resolved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    claimed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const res = await fetch(`/api/items/${item._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete item');
      }

      showToast('Item deleted successfully', 'success');
      onDelete?.(item._id);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete item', 'error');
    }
  };

  return (
    <Link href={`/items/${item._id}`}>
      <div className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow relative">
        {showDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              typeColors[item.type]
            )}
          >
            {item.type === 'lost' ? 'Lost' : 'Found'}
          </span>
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              statusColors[item.status]
            )}
          >
            {item.status}
          </span>
        </div>

        <h3 className="font-semibold text-zinc-900 dark:text-white mb-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
          {item.title}
        </h3>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
          <span>{item.location || 'No location'}</span>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
