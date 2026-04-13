'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';
import { profileUpdateSchema } from '@/schemas/auth';

interface ProfileData {
  email: string;
  name?: string;
  image?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export default function ProfileForm() {
  const { update } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    location: '',
    bio: '',
    image: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        const user = data.user as ProfileData;
        setFormData({
          email: user.email || '',
          name: user.name || '',
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
          image: user.image || '',
        });
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to fetch profile', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [showToast]);

  const syncProfileSession = async () => {
    await update();
  };

  const handleImageChange = async (image: string) => {
    const previousImage = formData.image;
    setFormData((current) => ({ ...current, image }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.image;
      return nextErrors;
    });

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile image');
      }

      const user = data.user as ProfileData;
      setFormData((current) => ({
        ...current,
        image: user.image || '',
      }));
      await syncProfileSession();
    } catch (error) {
      setFormData((current) => ({ ...current, image: previousImage }));
      showToast(error instanceof Error ? error.message : 'Failed to update profile image', 'error');
      throw error;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isImageUploading) {
      showToast('Please wait for the profile photo to finish uploading before saving.', 'error');
      return;
    }

    const parsedData = profileUpdateSchema.safeParse({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      bio: formData.bio.trim(),
      image: formData.image.trim(),
    });

    if (!parsedData.success) {
      const fieldErrors = parsedData.error.flatten().fieldErrors;
      const nextErrors: Record<string, string> = {};

      if (fieldErrors.name?.[0]) nextErrors.name = fieldErrors.name[0];
      if (fieldErrors.phone?.[0]) nextErrors.phone = fieldErrors.phone[0];
      if (fieldErrors.location?.[0]) nextErrors.location = fieldErrors.location[0];
      if (fieldErrors.bio?.[0]) nextErrors.bio = fieldErrors.bio[0];
      if (fieldErrors.image?.[0]) nextErrors.image = fieldErrors.image[0];

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData.data),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      const user = data.user as ProfileData;
      setFormData({
        email: user.email || '',
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        image: user.image || '',
      });
      await syncProfileSession();
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Profile</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Keep your personal details updated so people can reach you quickly.
        </p>
      </div>

      <ProfileImageUpload
        image={formData.image}
        onChange={handleImageChange}
        onUploadingChange={setIsImageUploading}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          value={formData.email}
          disabled
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
          error={errors.phone}
          placeholder="+91 98765 43210"
        />
        <Input
          label="Location"
          value={formData.location}
          onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
          error={errors.location}
          placeholder="City, Campus, or Area"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(event) => setFormData((current) => ({ ...current, bio: event.target.value }))}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          placeholder="Tell others a little about yourself or how to identify you."
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving || isImageUploading}>
          {isImageUploading ? 'Uploading Photo...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
