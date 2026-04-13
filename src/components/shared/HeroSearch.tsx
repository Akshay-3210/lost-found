'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function HeroSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'lost' | 'found'>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchType !== 'all') params.append('type', searchType);
    router.push(`/search?${params}`);
  };

  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
        Lost Something?
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
        Search through hundreds of lost and found items, or report an item you&apos;ve found
      </p>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="h-12"
            />
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as typeof searchType)}
            className="h-12 px-4 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="all">All Items</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <Button type="submit" size="lg">
            Search
          </Button>
        </div>
      </form>
    </section>
  );
}
