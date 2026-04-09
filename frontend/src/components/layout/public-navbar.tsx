'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  BellIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export function PublicNavbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2) || 'U';

  const getDashboardHref = () => {
    if (!user) return '/dashboard';
    if (user.role === 'ADMIN') return '/dashboard';
    if (user.role === 'PARTNER') return '/dashboard';
    return '/reservations';
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-white/70 backdrop-blur-xl shadow-[var(--shadow-sm)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <span className="text-xl font-extrabold text-blue-900 tracking-tighter font-[var(--font-headline)]">
                ReservasPro
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/resources"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-bold tracking-tight transition-all duration-150',
                  pathname.startsWith('/resources')
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] rounded-lg',
                )}
              >
                Explorar
              </Link>
            </nav>
          </div>

          {/* Right: Auth-dependent */}
          <div className="flex items-center gap-3">
            {isLoading ? null : isAuthenticated && user ? (
              <>
                {/* Dashboard link */}
                <Link
                  href={getDashboardHref()}
                  className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition-all"
                >
                  <Squares2X2Icon className="h-[18px] w-[18px]" />
                  Mi Panel
                </Link>

                {/* Notification */}
                <button className="p-2 rounded-full hover:bg-[var(--surface-container-low)] transition-colors text-[var(--on-surface-variant)]">
                  <BellIcon className="h-5 w-5" />
                </button>

                {/* User dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-[var(--outline-variant)] hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
                  >
                    <Bars3Icon className="h-4 w-4 text-[var(--on-surface-variant)] ml-1" />
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-[var(--surface-container-lowest)] rounded-xl shadow-[var(--shadow-xl)] border border-[var(--outline-variant)] py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-[var(--outline-variant)]">
                        <p className="text-sm font-semibold text-[var(--on-surface)]">{user.fullName}</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">{user.email}</p>
                      </div>
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors"
                      >
                        <Squares2X2Icon className="h-4 w-4" />
                        Mi Panel
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        Perfil
                      </Link>
                      <hr className="my-1 border-[var(--outline-variant)]" />
                      <button
                        onClick={() => { setMenuOpen(false); logout(); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--error-container)] transition-colors w-full cursor-pointer"
                      >
                        <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:inline-flex px-4 py-2 text-sm font-bold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex px-5 py-2 text-sm font-bold text-white bg-[var(--primary)] rounded-lg hover:opacity-90 transition-all active:scale-95 duration-200 shadow-[var(--shadow-md)]"
                >
                  Registrarse
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-container-low)] transition-colors cursor-pointer"
            >
              {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--outline-variant)] py-3 space-y-1 animate-fade-in">
            <Link
              href="/resources"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
            >
              <MagnifyingGlassIcon className="h-[18px] w-[18px]" />
              Explorar Recursos
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
                >
                  <Squares2X2Icon className="h-[18px] w-[18px]" />
                  Mi Panel
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--error)] hover:bg-[var(--error-container)] w-full cursor-pointer"
                >
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary-light)]"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
