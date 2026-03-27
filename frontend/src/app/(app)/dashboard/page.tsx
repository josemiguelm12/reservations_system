'use client';

import { useAuth } from '@/contexts/auth-context';
import { useDashboardStats } from '@/hooks/use-api';
import { useReservations } from '@/hooks/use-api';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiDollarSign, FiBox, FiUsers, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    // Clients don't have a dashboard — redirect to resources
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/resources');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return <DashboardContent user={user} isAdmin={isAdmin} />;
}

function DashboardContent({ user, isAdmin }: { user: any; isAdmin: boolean }) {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentReservations, isLoading: resLoading } = useReservations({
    page: 1,
    limit: 5,
  });

  const upcomingCount = recentReservations?.data?.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'PENDING'
  ).length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          You have {upcomingCount} reservation{upcomingCount !== 1 ? 's' : ''} scheduled for this week.
        </p>
      </div>

      {/* Stats cards - only for admin */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FiCalendar className="h-5 w-5" />}
            label="Total Reservas"
            value={String(stats.totalReservations)}
            sub={`${stats.pendingReservations} pendientes`}
            color="text-[var(--primary)]"
            bg="bg-[var(--primary-light)]"
          />
          <StatCard
            icon={<FiDollarSign className="h-5 w-5" />}
            label="Ingresos Totales"
            value={formatCurrency(stats.totalRevenue)}
            sub={`${formatCurrency(stats.monthlyRevenue)} este mes`}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<FiBox className="h-5 w-5" />}
            label="Recursos"
            value={String(stats.totalResources)}
            sub={`${stats.activeResources} activos`}
            color="text-violet-600"
            bg="bg-violet-50"
          />
          <StatCard
            icon={<FiUsers className="h-5 w-5" />}
            label="Usuarios"
            value={String(stats.totalUsers)}
            sub="registrados"
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>
      )}
      {isAdmin && statsLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Upcoming Reservations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Upcoming Reservations</h2>
          <Link
            href="/reservations"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
          >
            View Calendar
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {resLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : recentReservations?.data.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-8 text-sm text-[var(--muted-foreground)]">
                No tienes reservas aún.{' '}
                <Link href="/resources" className="text-[var(--primary)] hover:underline font-medium">
                  Explorar recursos
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReservations?.data.slice(0, 4).map((res) => (
              <Card
                key={res.id}
                hover
                onClick={() => router.push(`/reservations/${res.id}`)}
              >
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {res.resource?.name || 'Recurso'}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--muted-foreground)]">
                        <span className="material-icons-outlined" style={{ fontSize: '16px' }}>
                          calendar_today
                        </span>
                        {new Date(res.startTime).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-[var(--radius)] font-medium ${
                        res.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : res.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700'
                          : res.status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {res.status === 'PENDING'
                        ? 'Pendiente'
                        : res.status === 'CONFIRMED'
                        ? 'Confirmada'
                        : res.status === 'COMPLETED'
                        ? 'Completada'
                        : res.status === 'CANCELLED'
                        ? 'Cancelada'
                        : res.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {new Date(res.startTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(res.endTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(res.totalAmount)}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/resources" className="group">
            <Card hover>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-[var(--radius)] bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-outlined" style={{ fontSize: '20px' }}>add_circle</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] mb-0.5">
                      New Reservation
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      Book a suite, studio, or workspace in just a few clicks.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/reservations" className="group">
            <Card hover>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-[var(--radius)] bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-outlined" style={{ fontSize: '20px' }}>qr_code_scanner</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] mb-0.5">
                      Scan QR Access
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      Instantly unlock your reserved spaces using your digital key.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/resources" className="group">
            <Card hover>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-[var(--radius)] bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-outlined" style={{ fontSize: '20px' }}>explore</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] mb-0.5">
                      Browse Catalog
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      Explore our premium fleet of amenities and high-end services.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>

          {isAdmin && (
            <Link href="/admin/stats" className="group">
              <Card hover>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-[var(--radius)] bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-outlined" style={{ fontSize: '20px' }}>analytics</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[var(--foreground)] mb-0.5">
                        Estadísticas
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                        Ingresos y métricas de la plataforma
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--muted-foreground)] pt-8 pb-4 border-t border-[var(--border)]">
        <p>© {new Date().getFullYear()} Premium Reservations Inc. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="hover:text-[var(--foreground)] cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-[var(--foreground)] cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
            <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{value}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{sub}</p>
          </div>
          <div className={`h-10 w-10 rounded-[var(--radius)] ${bg} ${color} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}