'use client';

import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/sign-in' });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
    >
      Sign Out
    </Button>
  );
}
