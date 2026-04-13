import { Suspense } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import Header from '@/components/shared/Header';

function HeaderFallback() {
  return <div className="h-[73px] border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      {children}
    </ToastProvider>
  );
}
