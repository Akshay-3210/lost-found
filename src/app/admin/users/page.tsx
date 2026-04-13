import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminUsersManager from '@/components/admin/AdminUsersManager';
import Button from '@/components/ui/Button';
import SignOutButton from '@/components/auth/SignOutButton';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Admin Users - Lost & Found',
  description: 'Admin tools for reviewing and removing user profiles.',
};

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(to_bottom,_#fafafa,_#f4f4f5)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(to_bottom,_#09090b,_#18181b)]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/90 p-8 shadow-xl shadow-zinc-200/60 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/85 dark:shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-900 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-200">
                Admin User View
              </div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                Review every user profile and remove bad accounts fast.
              </h1>
              <p className="mt-3 text-base text-zinc-600 dark:text-zinc-300">
                Signed in as {session.user.email}. This screen is your admin user view: inspect profile cards and remove users from Atlas when necessary.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin">Back to Admin</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/users">Public Users Page</Link>
              </Button>
              <SignOutButton />
            </div>
          </div>
        </section>

        <ToastProvider>
          <AdminUsersManager />
        </ToastProvider>
      </div>
    </div>
  );
}
