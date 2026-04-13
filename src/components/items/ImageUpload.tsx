'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const { showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size must be less than 10MB', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Upload failed');
          }

          onChange([...images, data.url]);
          showToast('Image uploaded successfully', 'success');
        } catch (error) {
          showToast(error instanceof Error ? error.message : 'Upload failed', 'error');
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        showToast('Failed to read file', 'error');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast('Upload failed', 'error');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        Images
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-zinc-500 bg-zinc-50 dark:bg-zinc-800'
            : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFile(file);
            }
          }}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-500" />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Uploading image...
            </p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Drop an image here, or click to select
            </p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Upload ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
