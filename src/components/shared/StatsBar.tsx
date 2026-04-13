'use client';

import { useEffect, useState } from 'react';

export default function StatsBar() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    resolvedItems: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();
        const items = data.items || [];

        setStats({
          totalItems: items.length,
          lostItems: items.filter((i: { type: string }) => i.type === 'lost').length,
          foundItems: items.filter((i: { type: string }) => i.type === 'found').length,
          resolvedItems: items.filter((i: { status: string }) => i.status === 'resolved' || i.status === 'claimed').length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { label: 'Total Items', value: stats.totalItems },
    { label: 'Lost', value: stats.lostItems },
    { label: 'Found', value: stats.foundItems },
    { label: 'Reunited', value: stats.resolvedItems },
  ];

  return (
    <section className="mt-16 py-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statItems.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
              {item.value}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
