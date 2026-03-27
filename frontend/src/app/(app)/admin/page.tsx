'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardBody } from '@/components/ui/card';
import { FiBox, FiClock, FiUsers, FiBarChart2, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const adminLinks = [
  {
    href: '/admin/resources',
    icon: <FiBox className="h-6 w-6" />,
    title: 'Gestionar Recursos',
    desc: 'Crear, editar y eliminar recursos',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    href: '/admin/reservations',
    icon: <FiCalendar className="h-6 w-6" />,
    title: 'Reservas',
    desc: 'Ver, confirmar, completar y cancelar reservas',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    href: '/admin/schedules',
    icon: <FiClock className="h-6 w-6" />,
    title: 'Horarios',
    desc: 'Configurar horarios de disponibilidad',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    href: '/admin/users',
    icon: <FiUsers className="h-6 w-6" />,
    title: 'Usuarios',
    desc: 'Gestionar usuarios y roles',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    href: '/admin/stats',
    icon: <FiBarChart2 className="h-6 w-6" />,
    title: 'Estadísticas',
    desc: 'Ingresos, tendencias y métricas',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Administración</h1>
        <p className="text-[var(--text-secondary)] mt-1">Panel de control administrativo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card hover className="h-full">
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg ${link.bg} ${link.color} flex items-center justify-center`}>
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">{link.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{link.desc}</p>
                  </div>
                  <FiArrowRight className="h-5 w-5 text-[var(--text-muted)] mt-1" />
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
