'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReservation, useCancelReservation } from '@/hooks/use-api';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PaymentStatusBadge } from '@/components/ui/badge';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: reservation, isLoading } = useReservation(id);
  const cancelMutation = useCancelReservation();
  const [showCancel, setShowCancel] = useState(false);

  if (isLoading) return <FullPageLoader />;
  if (!reservation)
    return <div className="text-center py-12 text-[var(--text-muted)]">Reserva no encontrada</div>;

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(id);
    setShowCancel(false);
  };

  const handlePay = () => {
    router.push(`/reservations/${id}/payment`);
  };

  const canCancel = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  const canPay = reservation.status === 'PENDING' && !reservation.payment;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/reservations"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a Mis Reservas
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Reserva #{id.slice(0, 8)}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={reservation.status} />
          </div>
        </div>
        <div className="flex gap-2">
          {canPay && (
            <Button onClick={handlePay}>
              <CreditCardIcon className="h-4 w-4" />
              Pagar
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={() => setShowCancel(true)}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Resource info */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--text-primary)]">Recurso</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center text-3xl">
              🏢
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                {reservation.resource?.name}
              </h3>
              {reservation.resource?.location && (
                <p className="text-sm text-[var(--text-muted)] flex items-center gap-1 mt-1">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {reservation.resource.location}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--text-primary)]">Detalles</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <DetailRow
            icon={<CalendarDaysIcon className="h-4 w-4" />}
            label="Fecha"
            value={new Date(reservation.startTime).toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <DetailRow
            icon={<ClockIcon className="h-4 w-4" />}
            label="Horario"
            value={`${new Date(reservation.startTime).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })} - ${new Date(reservation.endTime).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}`}
          />
          <DetailRow
            icon={<CreditCardIcon className="h-4 w-4" />}
            label="Total"
            value={formatCurrency(reservation.totalAmount)}
          />
          {reservation.notes && (
            <DetailRow
              icon={<DocumentTextIcon className="h-4 w-4" />}
              label="Notas"
              value={reservation.notes}
            />
          )}
          <DetailRow
            icon={<CalendarDaysIcon className="h-4 w-4" />}
            label="Creada"
            value={new Date(reservation.createdAt).toLocaleString('es-ES')}
          />
        </CardBody>
      </Card>

      {/* Payments */}
      {reservation.payment && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text-primary)]">Pago</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatCurrency(reservation.payment.amount)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(reservation.payment.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
              <PaymentStatusBadge status={reservation.payment.status} />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Cancel Modal */}
      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Cancelar Reserva" size="sm">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowCancel(false)}>
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

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[var(--text-muted)] mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-sm text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
