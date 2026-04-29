'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { Modal } from '@/components/ui/modal';
import { useCancelReservation, useReservation } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CreditCardIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

function formatReceiptDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatReceiptTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function receiptReference(value: string, prefix: string) {
  return `${prefix}-${value.slice(0, 4).toUpperCase()}-${value.slice(4, 7).toUpperCase()}-${value.slice(7, 9).toUpperCase()}`;
}

export default function ReservationReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: reservation, isLoading } = useReservation(id);
  const cancelMutation = useCancelReservation();
  const [showCancel, setShowCancel] = useState(false);

  if (isLoading) return <FullPageLoader />;
  if (!reservation) {
    return (
      <div className="py-16 text-center text-sm text-[var(--on-surface-variant)]">
        Reserva no encontrada.
      </div>
    );
  }

  const canCancel = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  const canPay = reservation.status === 'PENDING' && !reservation.payment;
  const hours =
    (new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) /
    3600000;
  const baseRate = reservation.resource?.pricePerHour || 0;
  const subtotal = baseRate * hours;
  const serviceFee = Math.max(0, reservation.totalAmount - subtotal);
  const paymentAmount = reservation.payment?.amount || reservation.totalAmount;
  const clientName = reservation.user?.fullName || reservation.user?.email || 'Cliente';
  const transactionLabel = receiptReference(reservation.payment?.id || reservation.id, 'TXN');
  const authorizationLabel = `#${(reservation.payment?.id || reservation.id)
    .slice(0, 5)
    .toUpperCase()}`;
  const paymentLabel =
    reservation.payment?.status === 'COMPLETED'
      ? `Visa terminada en ${authorizationLabel.slice(-4)}`
      : reservation.payment
        ? 'Pago registrado'
        : 'Pago pendiente';

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(id);
    setShowCancel(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-12 pt-2 md:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--on-surface-variant)]">
        <Link href="/" className="transition-colors hover:text-[var(--primary)]">
          Inicio
        </Link>
        <span>{'>'}</span>
        <Link href="/reservations" className="transition-colors hover:text-[var(--primary)]">
          Mis Reservas
        </Link>
        <span>{'>'}</span>
        <span className="font-semibold text-[var(--on-surface)]">
          Recibo #{reservation.id.slice(0, 8)}
        </span>
      </nav>

      <section className="mx-auto max-w-3xl overflow-hidden rounded-[1.25rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] shadow-[0_18px_40px_rgba(11,28,48,0.05)]">
        <div className="flex flex-col gap-6 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-6 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-container-high)] text-[var(--primary)]">
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--on-surface)]">ReservePro</h1>
              <p className="text-sm text-[var(--on-surface-variant)]">Nexus Facilities</p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <h2 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-[var(--on-surface)]">
              RECIBO DE PAGO
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <CheckCircleIcon className="h-4 w-4" />
              {reservation.payment?.status === 'COMPLETED' || reservation.status === 'COMPLETED'
                ? 'PAGADO'
                : reservation.status === 'CANCELLED'
                  ? 'CANCELADO'
                  : 'PENDIENTE'}
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-7 md:px-8">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.04em] text-[var(--on-surface-variant)]">
              INFORMACION DE LA RESERVA
            </h3>

            <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
              <InfoBlock
                label="Recurso"
                value={reservation.resource?.name || 'Recurso'}
                extra={
                  reservation.resource?.location ? (
                    <span className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                      <MapPinIcon className="h-4 w-4" />
                      {reservation.resource.location}
                    </span>
                  ) : null
                }
              />
              <InfoBlock
                label="Fecha y Hora"
                value={`${formatReceiptDate(reservation.startTime)} | ${formatReceiptTime(
                  reservation.startTime,
                )} - ${formatReceiptTime(reservation.endTime)}`}
              />
              <InfoBlock label="ID Transaccion" value={transactionLabel} />
              <InfoBlock label="Cliente" value={clientName} />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.04em] text-[var(--on-surface-variant)]">
              DETALLE DE COBRO
            </h3>

            <div className="mt-5 rounded-xl bg-[var(--surface-container-low)] p-5">
              <ChargeRow
                label={`Tarifa Base (${hours === 1 ? '1 hora' : `${hours} horas`})`}
                value={formatCurrency(subtotal)}
                strong
              />
              <ChargeRow
                label="Cargo por Servicio (incluido)"
                value={formatCurrency(serviceFee)}
              />
              <div className="my-3 h-px bg-[var(--outline-variant)]" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-[1.05rem] font-semibold text-[var(--on-surface)]">
                  Total Pagado
                </span>
                <span className="text-[2rem] font-semibold tracking-[-0.03em] text-[var(--primary)]">
                  {formatCurrency(paymentAmount)}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.04em] text-[var(--on-surface-variant)]">
              METODO DE PAGO
            </h3>

            <div className="mt-5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-container-high)] text-[var(--primary)]">
                  <CreditCardIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--on-surface)]">{paymentLabel}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Autorizacion: {authorizationLabel}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--outline-variant)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Link href="/reservations">
                <Button
                  variant="ghost"
                  className="px-0 text-[var(--primary)] hover:bg-transparent hover:text-[var(--primary-container)]"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Volver a Mis Reservas
                </Button>
              </Link>
              {canPay && (
                <Button onClick={() => router.push(`/reservations/${id}/payment`)}>
                  Completar pago
                </Button>
              )}
              {canCancel && (
                <Button variant="danger" onClick={() => setShowCancel(true)}>
                  Cancelar reserva
                </Button>
              )}
            </div>

            <Button
              variant="secondary"
              className="justify-center border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
              onClick={() => window.print()}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Descargar PDF
            </Button>
          </div>

          <div className="flex justify-start">
            <StatusBadge status={reservation.status} />
          </div>
        </div>
      </section>

      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title="Cancelar Reserva"
        size="sm"
      >
        <p className="mb-4 text-sm text-[var(--on-surface-variant)]">
          Esta accion anulara la reserva y no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowCancel(false)}>
            No, mantener
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelMutation.isPending}>
            Si, cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  extra,
}: {
  label: string;
  value: string;
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-[var(--on-surface-variant)]">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-7 text-[var(--on-surface)]">{value}</p>
      {extra}
    </div>
  );
}

function ChargeRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span
        className={
          strong
            ? 'font-semibold text-[var(--on-surface)]'
            : 'text-[var(--on-surface-variant)]'
        }
      >
        {label}
      </span>
      <span
        className={
          strong
            ? 'text-lg font-semibold text-[var(--on-surface)]'
            : 'text-sm font-medium text-[var(--on-surface-variant)]'
        }
      >
        {value}
      </span>
    </div>
  );
}
