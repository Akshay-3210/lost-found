'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { ItemStatus } from '@/types';

interface AdminStatusActionsProps {
  itemId: string;
  currentStatus: ItemStatus;
  claimedByName?: string;
  busyKey: string | null;
  onStatusChange: (itemId: string, status: 'active' | 'resolved', claimedByName?: string) => void;
  onDelete: (itemId: string) => void;
}

export default function AdminStatusActions({
  itemId,
  currentStatus,
  claimedByName,
  busyKey,
  onStatusChange,
  onDelete,
}: AdminStatusActionsProps) {
  const [claimedNameInput, setClaimedNameInput] = useState(claimedByName || '');
  const isActiveBusy = busyKey === `${itemId}:active`;
  const isResolvedBusy = busyKey === `${itemId}:resolved`;
  const isDeleteBusy = busyKey === `${itemId}:delete`;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        Quick Status
      </p>
      <div className="grid gap-2">
        <label className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="mb-1 block font-medium">Claimed By</span>
          <input
            type="text"
            value={claimedNameInput}
            onChange={(event) => setClaimedNameInput(event.target.value)}
            placeholder="Enter claimant name"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          />
        </label>
        <Button
          type="button"
          variant={currentStatus === 'active' ? 'secondary' : 'outline'}
          isLoading={isActiveBusy}
          onClick={() => {
            setClaimedNameInput('');
            onStatusChange(itemId, 'active', '');
          }}
        >
          Mark Active
        </Button>
        <Button
          type="button"
          variant={currentStatus === 'resolved' ? 'secondary' : 'outline'}
          isLoading={isResolvedBusy}
          onClick={() => onStatusChange(itemId, 'resolved', claimedNameInput)}
        >
          Mark Resolved
        </Button>
        <Button
          type="button"
          variant="danger"
          isLoading={isDeleteBusy}
          onClick={() => onDelete(itemId)}
        >
          Remove Item
        </Button>
      </div>
    </div>
  );
}
