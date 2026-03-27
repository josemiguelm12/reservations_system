'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { FiMenu, FiX, FiLogOut, FiUser, FiBell } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', adminOnly: true },
  { href: '/resources', label: 'Explore', icon: 'explore' },
  { href: '/reservations', label: 'Reservations', icon: 'calendar_month' },
  { href: '/admin/resources', label: 'Recursos', icon: 'inventory_2', adminOnly: true },
  { href: '/admin/reservations', label: 'Reservas', icon: 'event_note', adminOnly: true },
  { href: '/admin/schedules', label: 'Horarios', icon: 'schedule', adminOnly: true },
  { href: '/admin/users', label: 'Usuarios', icon: 'group', adminOnly: true },
  { href: '/admin/stats', label: 'Stats', icon: 'bar_chart', adminOnly: true },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAdmin = user?.role === 'ADMIN';
  const visibleLinks = navLinks.filter((l) => !l.adminOnly || isAdmin);

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
    <header className="sticky top-0 z-40 bg-white border-b border-[var(--border)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href={isAdmin ? '/dashboard' : '/resources'} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-blue-500 flex items-center justify-center shadow-sm">
                <span className="material-icons-outlined text-white" style={{ fontSize: '18px' }}>
                  event_available
                </span>
              </div>
              <span className="text-[15px] font-bold text-[var(--foreground)] hidden sm:block">
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
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      active
                        ? 'text-[var(--primary)] bg-[var(--primary-light)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]',
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
            <button className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors cursor-pointer relative">
              <FiBell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[var(--primary)] rounded-full"></span>
            </button>

            {/* User dropdown */}
            {user && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--secondary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[var(--border)] py-1.5 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{user.fullName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FiUser className="h-4 w-4" />
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors cursor-pointer ml-1"
            >
              {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-[var(--border)] mt-1 pt-3 space-y-0.5 animate-fade-in">
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
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'text-[var(--primary)] bg-[var(--primary-light)]'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]',
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
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>settings</span>
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 cursor-pointer mt-1"
                >
                  <FiLogOut className="h-5 w-5" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <MobileLink href="/resources" onClick={() => setMobileOpen(false)}>Recursos</MobileLink>
                <div className="grid grid-cols-2 gap-2 px-4 pt-3 border-t border-[var(--border)]">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex justify-center items-center py-2.5 text-sm font-medium text-[var(--muted-foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex justify-center items-center py-2.5 text-sm font-semibold bg-[var(--primary)] text-white rounded-lg shadow-sm"
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

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
    >
      {children}
    </Link>
  );
}
