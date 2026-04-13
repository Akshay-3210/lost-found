'use client';

import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ProfileImageUploadProps {
  image: string;
  onChange: (image: string) => void | Promise<void>;
  onUploadingChange?: (isUploading: boolean) => void;
}

export default function ProfileImageUpload({ image, onChange, onUploadingChange }: ProfileImageUploadProps) {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size must be less than 10MB', 'error');
      return;
    }

    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: event.target?.result }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Upload failed');
          }

          await onChange(data.url);
          showToast('Profile image uploaded', 'success');
        } catch (error) {
          showToast(error instanceof Error ? error.message : 'Upload failed', 'error');
        } finally {
          setIsUploading(false);
          onUploadingChange?.(false);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        showToast('Failed to read image file', 'error');
        setIsUploading(false);
        onUploadingChange?.(false);
      };

      reader.readAsDataURL(file);
    } catch {
      showToast('Upload failed', 'error');
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image} src={image} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">No Photo</span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Profile Image</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Upload a clear photo so people can recognize you more easily.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFile(file);
              }
            }}
          />
          <Button
            type="button"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </Button>
          {image && (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                setIsUploading(true);
                onUploadingChange?.(true);

                try {
                  await onChange('');
                } finally {
                  setIsUploading(false);
                  onUploadingChange?.(false);
                }
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
