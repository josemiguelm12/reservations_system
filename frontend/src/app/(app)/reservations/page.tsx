'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useReservations, useCancelReservation } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState, Pagination } from '@/components/ui/empty-and-pagination';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';
import {
  CalendarDaysIcon,
  ClockIcon,
  ChevronRightIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ClockIcon as ClockSolidIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import type { Reservation, ReservationStatus } from '@/lib/types';

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

/* ─── Status badge config matching Stitch design ─── */
const statusConfig: Record<string, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  PENDING: {
    label: 'PENDIENTE',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    dotClass: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'CONFIRMADA',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'COMPLETADA',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    dotClass: 'bg-blue-500',
  },
  CANCELLED: {
    label: 'CANCELADA',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    dotClass: 'bg-red-500',
  },
};

/* ─── Resource type placeholder images ─── */
const typeGradients: Record<string, string> = {
  ROOM: 'from-blue-500 to-indigo-600',
  COURT: 'from-emerald-500 to-teal-600',
  DESK: 'from-orange-500 to-yellow-600',
  TABLE: 'from-pink-500 to-rose-600',
  EQUIPMENT: 'from-purple-500 to-violet-600',
  OTHER: 'from-slate-500 to-slate-700',
};

const typeIcons: Record<string, string> = {
  ROOM: '🏢',
  COURT: '🏟️',
  DESK: '💻',
  TABLE: '🪑',
  EQUIPMENT: '🔧',
  OTHER: '📦',
};

function ReservationStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${config.bgClass} ${config.textClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass} mr-1.5`}></span>
      {config.label}
    </span>
  );
}

function ResourceThumbnail({ reservation }: { reservation: Reservation }) {
  const type = reservation.resource?.type || 'OTHER';
  const gradient = typeGradients[type] || typeGradients.OTHER;
  const icon = typeIcons[type] || '📦';

  if (reservation.resource?.imageUrl) {
    return (
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
        <img
          src={reservation.resource.imageUrl}
          alt={reservation.resource.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl`}
    >
      {icon}
    </div>
  );
}

function getDurationLabel(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  if (hours >= 8) return 'Día completo';
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
}

function getPaymentSubtext(reservation: Reservation): string {
  if (reservation.status === 'PENDING') return 'Pago pendiente';
  if (reservation.status === 'CANCELLED') return 'Reserva cancelada';
  if (reservation.payment?.status === 'COMPLETED') return 'Transacción completada';
  return '';
}

export default function ReservationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading } = useReservations({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const cancelMutation = useCancelReservation();

  const handleCancel = async () => {
    if (!cancelId) return;
    await cancelMutation.mutateAsync(cancelId);
    setCancelId(null);
  };

  /* ─── Compute quick stats from loaded data ─── */
  const stats = useMemo(() => {
    if (!data?.data) return null;
    const reservations = data.data;

    // Next upcoming reservation
    const now = new Date();
    const upcoming = reservations
      .filter((r) => new Date(r.startTime) > now && (r.status === 'CONFIRMED' || r.status === 'PENDING'))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

    let nextLabel = 'Sin próximas';
    if (upcoming) {
      const diffDays = Math.ceil(
        (new Date(upcoming.startTime).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      const resourceName = upcoming.resource?.name || 'Reserva';
      nextLabel =
        diffDays === 0
          ? `${resourceName} • Hoy`
          : diffDays === 1
            ? `${resourceName} • Mañana`
            : `${resourceName} • En ${diffDays} días`;
    }

    // Monthly spending
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyTotal = reservations
      .filter((r) => {
        const d = new Date(r.startTime);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && r.status !== 'CANCELLED';
      })
      .reduce((sum, r) => sum + r.totalAmount, 0);

    // Total confirmed
    const totalConfirmed = reservations.filter((r) => r.status === 'CONFIRMED' || r.status === 'COMPLETED').length;

    return { nextLabel, monthlyTotal, totalConfirmed, hasUpcoming: !!upcoming };
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--on-surface-variant)]">
        <Link href="/resources" className="hover:text-[var(--primary)] transition-colors">
          Inicio
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-[var(--on-surface)] font-semibold">Mi Historial</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--primary)] font-[family-name:var(--font-manrope)] tracking-tight mb-1">
            Mi Historial de Reservas
          </h1>
          <p className="text-[var(--on-surface-variant)] font-medium">
            Revisa el detalle de tus reservas pasadas y próximas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none bg-white border border-[var(--outline-variant)]/30 rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-[var(--on-surface-variant)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
            >
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguas primero</option>
              <option value="amount">Por monto (Mayor)</option>
            </select>
            <ChevronUpDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--outline)] pointer-events-none" />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[var(--outline-variant)]/30 rounded-lg text-sm font-semibold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition-all cursor-pointer"
            >
              <FunnelIcon className="h-4 w-4" />
              Filtrar
              {statusFilter && (
                <span className="ml-1 w-2 h-2 rounded-full bg-[var(--primary)]"></span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[var(--outline-variant)]/10 py-2 z-20 min-w-[180px] animate-fade-in">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setPage(1);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                      statusFilter === opt.value
                        ? 'bg-[var(--primary)]/5 text-[var(--primary)] font-bold'
                        : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<CalendarDaysIcon className="h-12 w-12" />}
          title="No tienes reservas"
          description="Explora nuestros recursos y realiza tu primera reserva"
          action={
            <Link href="/resources">
              <Button>Explorar Recursos</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-xl overflow-hidden border border-[var(--outline-variant)]/10 shadow-sm">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[2.5fr_1.5fr_1fr_1fr_auto] bg-[var(--surface-container-low)]">
              <div className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--outline)]">
                Servicio / Recurso
              </div>
              <div className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--outline)]">
                Fecha y Duración
              </div>
              <div className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--outline)]">
                Total
              </div>
              <div className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--outline)]">
                Estado
              </div>
              <div className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[var(--outline)] text-right">
                Detalles
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[var(--outline-variant)]/5">
              {data?.data.map((reservation) => (
                <div
                  key={reservation.id}
                  className={`group grid grid-cols-1 lg:grid-cols-[2.5fr_1.5fr_1fr_1fr_auto] gap-3 lg:gap-0 px-6 py-5 hover:bg-[var(--surface-container-low)]/30 cursor-pointer transition-colors items-center ${
                    reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED'
                      ? 'opacity-75 hover:opacity-100'
                      : ''
                  }`}
                  onClick={() => router.push(`/reservations/${reservation.id}`)}
                >
                  {/* Resource with thumbnail */}
                  <div className="flex items-center gap-4">
                    <ResourceThumbnail reservation={reservation} />
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--on-surface)] font-[family-name:var(--font-manrope)] truncate">
                        {reservation.resource?.name || 'Recurso'}
                      </div>
                      <div className="text-xs text-[var(--outline)] truncate">
                        {reservation.resource?.location || reservation.resource?.type || ''}
                      </div>
                    </div>
                  </div>

                  {/* Date & Duration */}
                  <div className="lg:px-6">
                    <div className="text-sm font-medium text-[var(--on-surface)]">
                      {new Date(reservation.startTime).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-[var(--outline)] mt-0.5">
                      {new Date(reservation.startTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(reservation.endTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' '}
                      ({getDurationLabel(reservation.startTime, reservation.endTime)})
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="lg:px-6">
                    <div className="text-sm font-bold text-[var(--primary)]">
                      {formatCurrency(reservation.totalAmount)}
                    </div>
                    <div className="text-[10px] text-[var(--outline)] mt-0.5">
                      {getPaymentSubtext(reservation)}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="lg:px-6">
                    <ReservationStatusBadge status={reservation.status} />
                  </div>

                  {/* Actions */}
                  <div className="lg:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    {reservation.status === 'PENDING' && (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => router.push(`/reservations/${reservation.id}/payment`)}
                          className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[var(--primary-container)] transition-all active:scale-95 cursor-pointer"
                        >
                          Pagar Ahora
                        </button>
                        <button
                          onClick={() => setCancelId(reservation.id)}
                          className="text-[var(--outline)] hover:text-[var(--error)] transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Cancelar reserva"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {reservation.status === 'CONFIRMED' && (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => router.push(`/reservations/${reservation.id}`)}
                          className="text-[var(--primary)] hover:text-[var(--primary-container)] font-bold text-xs underline underline-offset-4 transition-colors cursor-pointer"
                        >
                          Ver Recibo
                        </button>
                        <button
                          onClick={() => setCancelId(reservation.id)}
                          className="text-[var(--outline)] hover:text-[var(--error)] transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Cancelar reserva"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {reservation.status === 'COMPLETED' && (
                      <button
                        onClick={() => router.push(`/reservations/${reservation.id}`)}
                        className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[var(--surface-variant)] transition-all cursor-pointer"
                      >
                        Ver Factura
                      </button>
                    )}
                    {reservation.status === 'CANCELLED' && (
                      <span className="text-xs text-[var(--outline)] italic">Cancelada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {data && (
            <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Quick Stats Cards */}
      {stats && data && data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Next Activity */}
          <div className="bg-[var(--primary)]/5 p-6 rounded-2xl border border-[var(--primary)]/5">
            <div className="flex justify-between items-start mb-4">
              <ClockSolidIcon className="h-6 w-6 text-[var(--primary)]" />
              {stats.hasUpcoming && (
                <span className="text-[10px] font-black bg-[var(--primary)] text-white px-2 py-0.5 rounded">
                  PRÓXIMA
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-[var(--primary)]/70 uppercase tracking-widest mb-1">
              Próxima Actividad
            </div>
            <div className="text-base font-extrabold text-[var(--primary)] font-[family-name:var(--font-manrope)]">
              {stats.nextLabel}
            </div>
          </div>

          {/* Monthly Investment */}
          <div className="bg-[var(--surface-container-high)] p-6 rounded-2xl border border-[var(--outline-variant)]/10">
            <div className="flex justify-between items-start mb-4">
              <CurrencyDollarIcon className="h-6 w-6 text-[var(--on-surface-variant)]" />
            </div>
            <div className="text-xs font-semibold text-[var(--outline)] uppercase tracking-widest mb-1">
              Inversión este mes
            </div>
            <div className="text-base font-extrabold text-[var(--on-surface)] font-[family-name:var(--font-manrope)]">
              {formatCurrency(stats.monthlyTotal)} USD
            </div>
          </div>

          {/* User Status */}
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-500/5">
            <div className="flex justify-between items-start mb-4">
              <CheckBadgeIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-xs font-semibold text-emerald-600/70 uppercase tracking-widest mb-1">
              Reservas Exitosas
            </div>
            <div className="text-base font-extrabold text-emerald-700 font-[family-name:var(--font-manrope)]">
              {stats.totalConfirmed} completadas
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancelar Reserva" size="sm">
        <p className="text-sm text-[var(--on-surface-variant)] mb-4">
          ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setCancelId(null)}>
            No, mantener
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelMutation.isPending}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>

      {/* Click outside to close filter */}
      {showFilterMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
      )}
    </div>
  );
}
