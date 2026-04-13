'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  roles?: string[]; // If undefined, anyone can see it
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN', 'PARTNER'] },
  { href: '/resources', label: 'Explorar', icon: 'explore', roles: ['ADMIN', 'CLIENT'] },
  { href: '/reservations', label: 'Mis Reservas', icon: 'calendar_month', roles: ['CLIENT', 'ADMIN'] },
  { href: '/admin/resources', label: 'Recursos', icon: 'inventory_2', roles: ['ADMIN', 'PARTNER'] },
  { href: '/admin/reservations', label: 'Recibidas', icon: 'event_note', roles: ['ADMIN', 'PARTNER'] },
  { href: '/admin/schedules', label: 'Horarios', icon: 'schedule', roles: ['ADMIN', 'PARTNER'] },
  { href: '/admin/users', label: 'Usuarios', icon: 'group', roles: ['ADMIN'] },
  { href: '/admin/stats', label: 'Stats', icon: 'bar_chart', roles: ['ADMIN'] },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isPartnerOrAdmin = user?.role === 'PARTNER' || user?.role === 'ADMIN';
  const visibleLinks = navLinks.filter((l) => !l.roles || (user && l.roles.includes(user.role)));

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

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl shadow-[var(--shadow-sm)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href={isPartnerOrAdmin ? '/dashboard' : '/resources'} className="flex items-center gap-2.5 flex-shrink-0">
              <span className="text-xl font-extrabold text-blue-900 tracking-tighter font-[family-name:var(--font-manrope)]">
                ReservasPro
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {visibleLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold tracking-tight transition-all duration-150',
                      active
                        ? 'text-blue-700 border-b-2 border-blue-700'
                        : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]',
                    )}
                  >
                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] transition-colors cursor-pointer relative">
              <BellIcon className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[var(--primary)] rounded-full"></span>
            </button>

            {/* User dropdown */}
            {user && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--surface-container-low)] transition-colors cursor-pointer border border-transparent hover:border-[var(--outline-variant)]"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] flex items-center justify-center text-white text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="text-sm font-bold text-[var(--on-surface)] hidden sm:block">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[var(--surface-container-lowest)] rounded-xl shadow-[var(--shadow-xl)] border border-[var(--outline-variant)] py-1.5 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-[var(--outline-variant)]">
                      <p className="text-sm font-semibold text-[var(--on-surface)]">{user.fullName}</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--error-container)] transition-colors cursor-pointer"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] transition-colors cursor-pointer ml-1"
            >
              {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-[var(--outline-variant)] mt-1 pt-3 space-y-0.5 animate-fade-in">
            {user ? (
              <>
                {visibleLinks.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors',
                        active
                          ? 'text-[var(--primary)] bg-[var(--primary-light)]'
                          : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]',
                      )}
                    >
                      <span className="material-icons-outlined" style={{ fontSize: '20px' }}>
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors"
                >
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>settings</span>
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--error)] rounded-lg hover:bg-[var(--error-container)] cursor-pointer mt-1"
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/resources"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-bold text-[var(--on-surface-variant)] rounded-lg hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors"
                >
                  Recursos
                </Link>
                <div className="grid grid-cols-2 gap-2 px-4 pt-3 border-t border-[var(--outline-variant)]">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex justify-center items-center py-2.5 text-sm font-bold text-[var(--on-surface-variant)] border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-low)]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex justify-center items-center py-2.5 text-sm font-bold bg-[var(--primary)] text-white rounded-lg shadow-[var(--shadow-sm)]"
                  >
                    Registrarse
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
