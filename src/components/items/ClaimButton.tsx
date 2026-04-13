'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ClaimButtonProps {
  itemId: string;
}

export default function ClaimButton({ itemId }: ClaimButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClaim = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/items/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to claim item' });
      } else {
        setMessage({ type: 'success', text: data.message || 'Item claimed successfully' });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleClaim} isLoading={isLoading} className="w-full">
        Claim This Item
      </Button>
      {message && (
        <p
          className={cn(
            'mt-2 text-sm text-center',
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          )}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
