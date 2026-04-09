import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from '@/contexts/query-provider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'ReservasPro | Precision Curator',
  description:
    'Marketplace premium de espacios arquitectónicos. Reserva salas, canchas, escritorios y más con un solo clic.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
