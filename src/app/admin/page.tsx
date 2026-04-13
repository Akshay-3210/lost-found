import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminItemsManager from '@/components/admin/AdminItemsManager';
import Button from '@/components/ui/Button';
import SignOutButton from '@/components/auth/SignOutButton';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Admin - Lost & Found',
  description: 'Admin controls for all lost and found items',
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),radial-gradient(circle_at_right,_rgba(34,197,94,0.16),_transparent_28%),linear-gradient(to_bottom,_#fafafa,_#f4f4f5)] dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15),_transparent_28%),radial-gradient(circle_at_right,_rgba(34,197,94,0.12),_transparent_24%),linear-gradient(to_bottom,_#09090b,_#18181b)]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/90 p-8 shadow-xl shadow-zinc-200/60 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/85 dark:shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
                Admin Session Active
              </div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                Control every lost and found record from one place.
              </h1>
              <p className="mt-3 text-base text-zinc-600 dark:text-zinc-300">
                Signed in as {session.user.email}. Review reports, switch items between lost and found, update their resolution state, or remove invalid listings from the database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/search">Browse Listings</Link>
              </Button>
              <Button asChild>
                <Link href="/items/new">Create Item</Link>
              </Button>
              <SignOutButton />
            </div>
          </div>
        </section>

        <ToastProvider>
          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/85">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Moderation Workspace</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Each card below lets you edit item classification instantly. Changes are saved to the same database records the public app uses.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/85">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Admin Actions</h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/admin/user-view">User View</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">Switch Account</Link>
                  </Button>
                </div>
              </div>
            </div>

            <AdminItemsManager />
          </section>
        </ToastProvider>
      </div>
    </div>
  );
}
