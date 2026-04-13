'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface UserMessageFormProps {
  recipientId: string;
  recipientName?: string;
}

export default function UserMessageForm({ recipientId, recipientName }: UserMessageFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      showToast('Please enter a message before sending.', 'error');
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch(`/api/users/${recipientId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setMessage('');
      router.refresh();
      showToast(data.message || 'Message sent successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {recipientName ? `Message ${recipientName}` : 'Message'}
        </label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={500}
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          placeholder="Write a message to this user."
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {message.trim().length}/500 characters
        </p>
      </div>

      <Button type="submit" isLoading={isSending}>
        Send
      </Button>
    </form>
  );
}
