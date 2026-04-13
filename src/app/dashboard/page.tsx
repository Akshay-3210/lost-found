import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ItemList from '@/components/items/ItemList';
import Button from '@/components/ui/Button';
import SignOutButton from '@/components/auth/SignOutButton';
import { ToastProvider } from '@/components/ui/Toast';
import ProfileForm from '@/components/profile/ProfileForm';

interface DashboardPageProps {
  searchParams: Promise<{ section?: string }>;
}

export const metadata: Metadata = {
  title: 'Dashboard - Lost & Found',
  description: 'Manage your lost and found items',
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();
  const { section } = await searchParams;
  const currentSection = section === 'profile' ? 'profile' : 'items';

  if (!session?.user) {
    redirect('/sign-in');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/items/new">Report Item</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        <ToastProvider>
          <div className="grid gap-8">
            <div className="flex flex-wrap gap-3">
              <Button variant={currentSection === 'items' ? 'primary' : 'outline'} asChild>
                <Link href="/dashboard">My Items</Link>
              </Button>
              <Button variant={currentSection === 'profile' ? 'primary' : 'outline'} asChild>
                <Link href="/profile">Profile</Link>
              </Button>
            </div>

            {currentSection === 'profile' ? (
              <section>
                <ProfileForm />
              </section>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                    Your Lost Items
                  </h2>
                  <ItemList type="lost" userId={session.user.id} showDelete />
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                    Your Found Items
                  </h2>
                  <ItemList type="found" userId={session.user.id} showDelete />
                </section>
              </>
            )}
          </div>
        </ToastProvider>
      </div>
    </div>
  );
}
