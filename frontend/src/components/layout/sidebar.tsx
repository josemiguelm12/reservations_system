'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const links: SidebarLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', adminOnly: true },
  { href: '/resources', label: 'Explorar', icon: 'explore' },
  { href: '/reservations', label: 'Reservas', icon: 'calendar_month' },
  { href: '/admin/resources', label: 'Gestionar Recursos', icon: 'settings', adminOnly: true },
  { href: '/admin/reservations', label: 'Reservas (Admin)', icon: 'event_note', adminOnly: true },
  { href: '/admin/schedules', label: 'Horarios', icon: 'schedule', adminOnly: true },
  { href: '/admin/users', label: 'Usuarios', icon: 'group', adminOnly: true },
  { href: '/admin/stats', label: 'Estadísticas', icon: 'bar_chart', adminOnly: true },
];

const bottomLinks: SidebarLink[] = [
  { href: '/profile', label: 'Settings', icon: 'settings' },
  { href: '#', label: 'Support', icon: 'help' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredLinks = links.filter((l) => !l.adminOnly || user?.role === 'ADMIN');

  const initials = user?.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2) || 'U';

  return (
    <aside className="hidden lg:flex flex-col w-[var(--sidebar-width)] bg-[var(--surface-container-lowest)] border-r border-[var(--outline-variant)] min-h-screen fixed top-0 left-0 z-30">
      {/* User profile section */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] flex items-center justify-center text-white text-sm font-semibold shadow-[var(--shadow-md)]">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--on-surface)] truncate">
              {user?.fullName || 'Usuario'}
            </p>
            <p className="text-xs text-[var(--on-surface-variant)]">Premium Member</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {filteredLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-150',
                active
                  ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-md)]'
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
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-5 space-y-0.5 border-t border-[var(--outline-variant)] pt-3">
        {bottomLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-150',
                active
                  ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-md)]'
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
      </div>
    </aside>
  );
}
