'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import ImageUpload from './ImageUpload';
import { Item } from '@/types';

interface ItemFormProps {
  item?: Item;
  isEdit?: boolean;
}

export default function ItemForm({ item, isEdit = false }: ItemFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost' as 'lost' | 'found',
    location: '',
    date: '',
    contactInfo: '',
    images: [] as string[],
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        type: item.type,
        location: item.location || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        contactInfo: item.contactInfo || '',
        images: item.images || [],
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEdit ? `/api/items/${item?._id}` : '/api/items';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} item`);
      }

      showToast(`Item ${isEdit ? 'updated' : 'created'} successfully`, 'success');
      router.push(isEdit ? `/items/${item?._id}` : '/dashboard');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="lost"
            checked={formData.type === 'lost'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'lost' | 'found' })}
            className="w-4 h-4"
          />
          <span className="text-zinc-700 dark:text-zinc-300">Lost Item</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="found"
            checked={formData.type === 'found'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'lost' | 'found' })}
            className="w-4 h-4"
          />
          <span className="text-zinc-700 dark:text-zinc-300">Found Item</span>
        </label>
      </div>

      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Black Wallet, Blue Keys"
        required
      />

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the item in detail..."
          rows={4}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-white"
          required
        />
      </div>

      <Input
        label="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="e.g., Main Street, Building A"
      />

      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      />

      <Input
        label="Contact Info"
        value={formData.contactInfo}
        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
        placeholder="Phone number or alternate email"
      />

      <ImageUpload
        images={formData.images}
        onChange={(images) => setFormData({ ...formData, images })}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        {isEdit
          ? formData.type === 'lost'
            ? 'Update Lost Item'
            : 'Update Found Item'
          : formData.type === 'lost'
          ? 'Report Lost Item'
          : 'Report Found Item'}
      </Button>
    </form>
  );
}
