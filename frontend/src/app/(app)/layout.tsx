'use client';

import { useAuth } from '@/contexts/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <FullPageLoader />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] font-[family-name:var(--font-manrope)]">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
