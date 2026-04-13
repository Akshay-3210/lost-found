import { ToastProvider } from '@/components/ui/Toast';
import Header from '@/components/shared/Header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Header />
      {children}
    </ToastProvider>
  );
}
