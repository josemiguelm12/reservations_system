'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminReservations, useUpdateReservationStatus } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusBadge, PaymentStatusBadge } from '@/components/ui/badge';
import { Pagination, EmptyState } from '@/components/ui/empty-and-pagination';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';
import type { ReservationStatus } from '@/lib/types';
import {
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiCheck,
  FiFilter,
  FiEye,
} from 'react-icons/fi';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

export default function AdminReservationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useAdminReservations({ page, limit: 10, status: statusFilter || undefined });
  const updateStatus = useUpdateReservationStatus();

  /* ─── Confirm / Complete / Cancel modals ─── */
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    id: string;
    status: string;
    action: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    label: string;
  }>({ open: false, id: '', status: '', action: 'CONFIRMED', label: '' });

  const openAction = (id: string, currentStatus: string, action: typeof actionModal.action) => {
    const labels = {
      CONFIRMED: 'Confirmar',
      COMPLETED: 'Completar',
      CANCELLED: 'Cancelar',
    };
    setActionModal({ open: true, id, status: currentStatus, action, label: labels[action] });
  };

  const handleAction = async () => {
    await updateStatus.mutateAsync({ id: actionModal.id, status: actionModal.action });
    setActionModal((prev) => ({ ...prev, open: false }));
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestionar Reservas</h1>
        <p className="text-[var(--text-secondary)] mt-1">Administra todas las reservas del sistema</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <FiFilter className="h-4 w-4 text-[var(--text-muted)]" />
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
              statusFilter === opt.value
                ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={<FiCalendar className="h-12 w-12" />}
          title="Sin reservas"
          description="No hay reservas que coincidan con el filtro seleccionado."
        />
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Reserva
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Usuario
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Recurso
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Fecha / Hora
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Monto
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Estado
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Pago
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {data.data.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      {/* ID */}
                      <td className="px-6 py-4 text-sm font-mono text-[var(--text-primary)]">
                        #{r.id.slice(0, 8)}
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {r.user?.fullName || 'N/A'}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">{r.user?.email}</p>
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {r.resource?.name || 'N/A'}
                      </td>

                      {/* Date/Time */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-primary)]">
                          {new Date(r.startTime).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(r.startTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(r.endTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                        {formatCurrency(r.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        {r.payment ? (
                          <PaymentStatusBadge status={r.payment.status} />
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Sin pago</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reservations/${r.id}`)}
                            title="Ver detalle"
                          >
                            <FiEye className="h-4 w-4" />
                          </Button>
                          {r.status === 'PENDING' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openAction(r.id, r.status, 'CONFIRMED')}
                              title="Confirmar"
                            >
                              <FiCheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {r.status === 'CONFIRMED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openAction(r.id, r.status, 'COMPLETED')}
                              title="Completar"
                            >
                              <FiCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openAction(r.id, r.status, 'CANCELLED')}
                              title="Cancelar"
                            >
                              <FiXCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {data && (
            <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Action Confirmation Modal */}
      <Modal
        open={actionModal.open}
        onClose={() => setActionModal((prev) => ({ ...prev, open: false }))}
        title={`${actionModal.label} Reserva`}
        size="sm"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          ¿Estás seguro de que quieres{' '}
          <strong>{actionModal.label.toLowerCase()}</strong> esta reserva?
          {actionModal.action === 'CANCELLED' &&
            ' Esta acción no se puede deshacer.'}
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}
          >
            No, volver
          </Button>
          <Button
            variant={actionModal.action === 'CANCELLED' ? 'danger' : 'primary'}
            onClick={handleAction}
            loading={updateStatus.isPending}
          >
            Sí, {actionModal.label.toLowerCase()}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
