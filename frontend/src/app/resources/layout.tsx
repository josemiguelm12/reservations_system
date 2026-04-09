import { PublicNavbar } from '@/components/layout/public-navbar';

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PublicNavbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
