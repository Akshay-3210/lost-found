'use client';

import { useEffect, useState } from 'react';
import { Item, ItemType } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import AdminStatusActions from '@/components/admin/AdminStatusActions';

const typeOptions: ItemType[] = ['lost', 'found'];

export default function AdminItemsManager() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch items');
        }

        setItems(data.items || []);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to fetch items', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [showToast]);

  const handleUpdate = async (itemId: string, field: 'type', value: ItemType) => {
    const item = items.find((entry) => entry._id === itemId);

    if (!item) {
      return;
    }

    setBusyKey(`${itemId}:${field}`);

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          location: item.location || '',
          contactInfo: item.contactInfo || '',
          images: item.images || [],
          date: item.date ? new Date(item.date).toISOString() : undefined,
          type: value,
          status: item.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update item');
      }

      setItems((current) =>
        current.map((entry) =>
          entry._id === itemId
            ? { ...entry, type: value }
            : entry
        )
      );
      showToast('Item updated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update item', 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const handleStatusChange = async (itemId: string, status: 'active' | 'resolved', claimedByName = '') => {
    setBusyKey(`${itemId}:${status}`);

    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, claimedByName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update item status');
      }

      setItems((current) =>
        current.map((item) =>
          item._id === itemId
            ? { ...item, status, claimedByName: status === 'resolved' ? claimedByName : '' }
            : item
        )
      );
      showToast(`Item marked as ${status}`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update item status', 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item from the database?')) {
      return;
    }

    setBusyKey(`${itemId}:delete`);

    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete item');
      }

      setItems((current) => current.filter((item) => item._id !== itemId));
      showToast('Item removed successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete item', 'error');
    } finally {
      setBusyKey(null);
    }
  };

  if (isLoading) {
    return <p className="text-zinc-600 dark:text-zinc-400">Loading all items...</p>;
  }

  if (items.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No items found.</p>;
  }

  const totalItems = items.length;
  const lostCount = items.filter((item) => item.type === 'lost').length;
  const foundCount = items.filter((item) => item.type === 'found').length;
  const resolvedCount = items.filter((item) => item.status !== 'active').length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total items</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{totalItems}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40">
          <p className="text-sm text-amber-700 dark:text-amber-300">Lost reports</p>
          <p className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-100">{lostCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Found reports</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">{foundCount}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40">
          <p className="text-sm text-sky-700 dark:text-sky-300">Closed cases</p>
          <p className="mt-2 text-3xl font-bold text-sky-900 dark:text-sky-100">{resolvedCount}</p>
        </div>
      </div>

      {items.map((item) => (
        <div
          key={item._id}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{item.title}</h2>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    item.type === 'lost'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                  }`}
                >
                  {item.type.toUpperCase()}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    item.status === 'active'
                      ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                      : item.status === 'resolved'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
                        : 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
              <div className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-500 sm:grid-cols-2">
                <p>Location: {item.location || 'Not provided'}</p>
                <p>Contact: {item.contactInfo || 'Not provided'}</p>
                <p>Claimed by: {item.status === 'resolved' && item.claimedByName ? item.claimedByName : 'None'}</p>
                <p>Created: {formatDate(item.createdAt)}</p>
                <p className="truncate">ID: {item._id}</p>
              </div>
            </div>

            <div className="grid gap-3 lg:min-w-[520px] lg:grid-cols-[minmax(0,1fr)_180px]">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="mb-1 block font-medium">Type</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    value={item.type}
                    disabled={busyKey === `${item._id}:type`}
                    onChange={(event) => handleUpdate(item._id, 'type', event.target.value as ItemType)}
                  >
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <AdminStatusActions
                itemId={item._id}
                currentStatus={item.status}
                claimedByName={item.claimedByName}
                busyKey={busyKey}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
