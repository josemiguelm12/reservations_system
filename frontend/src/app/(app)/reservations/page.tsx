'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReservations, useCancelReservation } from '@/hooks/use-api';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form-fields';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState, Pagination } from '@/components/ui/empty-and-pagination';
import { StatusBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';
import { FiCalendar, FiClock, FiX } from 'react-icons/fi';
import Link from 'next/link';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

export default function ReservationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Reservations</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage and review all your bookings</p>
        </div>
        <Link href="/resources">
          <Button>+ New Reservation</Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-48 text-sm"
        />
      </div>

      {/* Table-style list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<FiCalendar className="h-12 w-12" />}
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
          <Card>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              <span>Resource</span>
              <span>Date & Time</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[var(--border)]">
              {data?.data.map((reservation) => (
                <div
                  key={reservation.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-2 md:gap-4 px-6 py-4 hover:bg-[var(--secondary)]/50 cursor-pointer transition-colors items-center"
                  onClick={() => router.push(`/reservations/${reservation.id}`)}
                >
                  {/* Resource */}
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--foreground)]">
                      {reservation.resource?.name || 'Recurso'}
                    </h3>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="h-3.5 w-3.5" />
                      {new Date(reservation.startTime).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <FiClock className="h-3 w-3" />
                      {new Date(reservation.startTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(reservation.endTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Amount */}
                  <div>
                    <span className="font-semibold text-sm text-[var(--foreground)]">
                      {formatCurrency(reservation.totalAmount)}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={reservation.status} />
                  </div>

                  {/* Actions */}
                  <div>
                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancelId(reservation.id);
                        }}
                      >
                        <FiX className="h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {data && (
            <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Cancel Modal */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancelar Reserva" size="sm">
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
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
    </div>
  );
}
