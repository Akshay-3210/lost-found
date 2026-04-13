'use client';

import { useEffect, useState } from 'react';
import { Item } from '@/types';
import ItemCard from './ItemCard';

interface ItemListProps {
  type?: 'lost' | 'found';
  status?: 'active' | 'resolved' | 'claimed';
  userId?: string;
  showDelete?: boolean;
}

export default function ItemList({ type, status, userId, showDelete = false }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleDelete = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (status) params.append('status', status);
        if (userId) params.append('userId', userId);

        const res = await fetch(`/api/items?${params}`);
        const data = await res.json();
        setItems(data.items || []);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [type, status, userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">No items found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} showDelete={showDelete} onDelete={handleDelete} />
      ))}
    </div>
  );
}
