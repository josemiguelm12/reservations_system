'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useReservation, useCreatePaymentIntent } from '@/hooks/use-api';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeftIcon, CreditCardIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
console.log('Stripe Publishable Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

/* ─── Inner form (inside Stripe Elements) ─── */
function CheckoutForm({
  amount,
  reservationId,
}: {
  amount: number;
  reservationId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reservations/${reservationId}?payment=success`,
      },
    });

    // This will only be reached if there's an immediate error.
    // Otherwise, Stripe redirects to the return_url.
    if (submitError) {
      setError(submitError.message || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          <XCircleIcon className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-[var(--text-secondary)]">
          Total a pagar: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</span>
        </p>
        <Button type="submit" loading={loading} disabled={!stripe || !elements}>
          <CreditCardIcon className="h-4 w-4" />
          Pagar {formatCurrency(amount)}
        </Button>
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Pago seguro procesado por Stripe. Tarjeta de prueba: 4242 4242 4242 4242
      </p>
    </form>
  );
}

/* ─── Main page ─── */
export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: reservation, isLoading } = useReservation(id);
  const createIntent = useCreatePaymentIntent();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (reservation && !clientSecret && reservation.status === 'PENDING') {
      createIntent
        .mutateAsync(id)
        .then((result) => {
          setClientSecret(result.clientSecret);
        })
        .catch((err) => {
          setPaymentError(err.response?.data?.message || 'Error al iniciar pago');
        });
    }
  }, [reservation, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <FullPageLoader />;
  if (!reservation)
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        Reserva no encontrada
      </div>
    );

  // Already paid or completed
  if (reservation.payment?.status === 'COMPLETED' || reservation.status === 'CONFIRMED' || reservation.status === 'COMPLETED') {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4 py-12">
        <CheckCircleIcon className="h-16 w-16 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reserva Confirmada</h1>
        <p className="text-[var(--text-secondary)]">
          Esta reserva ya ha sido pagada y confirmada.
        </p>
        <Link href={`/reservations/${id}`}>
          <Button>Ver Detalle</Button>
        </Link>
      </div>
    );
  }

  // Cancelled
  if (reservation.status === 'CANCELLED') {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4 py-12">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reserva Cancelada</h1>
        <p className="text-[var(--text-secondary)]">No se puede procesar el pago de una reserva cancelada.</p>
        <Link href="/reservations">
          <Button variant="secondary">Volver a Reservas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/reservations/${id}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver al detalle
      </Link>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pagar Reserva</h1>

      {/* Reservation summary */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--text-primary)]">Resumen</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Recurso</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {reservation.resource?.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Fecha</span>
            <span className="text-sm text-[var(--text-primary)]">
              {new Date(reservation.startTime).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Horario</span>
            <span className="text-sm text-[var(--text-primary)]">
              {new Date(reservation.startTime).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              -{' '}
              {new Date(reservation.endTime).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Estado</span>
            <StatusBadge status={reservation.status} />
          </div>
          <hr className="border-[var(--border-primary)]" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Total</span>
            <span className="text-lg font-bold text-[var(--brand)]">
              {formatCurrency(reservation.totalAmount)}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Stripe Payment */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Datos de Pago
          </h2>
        </CardHeader>
        <CardBody>
          {paymentError ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              <XCircleIcon className="h-4 w-4 shrink-0" />
              {paymentError}
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#6366f1',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <CheckoutForm amount={reservation.totalAmount} reservationId={id} />
            </Elements>
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)]">
              Preparando formulario de pago...
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
