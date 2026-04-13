'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ChatDeleteButtonProps {
  messageId: string;
}

export default function ChatDeleteButton({ messageId }: ChatDeleteButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete message');
      }

      router.refresh();
      showToast('Message deleted', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete message', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button type="button" size="sm" variant="ghost" isLoading={isDeleting} onClick={handleDelete}>
      Delete
    </Button>
  );
}
