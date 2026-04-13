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
import { Button } from '@/components/ui/button';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  XCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

/* ─── Resource type gradients for placeholder thumbnails ─── */
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

/* ─── Helper: calculate duration label ─── */
function getDurationLabel(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (hours >= 8) return 'Día completo';
  if (hours === 1) return '1 hora';
  if (hours === Math.floor(hours)) return `${hours} horas`;
  return `${hours.toFixed(1)} horas`;
}

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

    if (submitError) {
      setError(submitError.message || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
          <XCircleIcon className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Cancellation Policy */}
      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
        <p className="text-xs text-blue-900/70 leading-relaxed">
          <span className="font-bold">Política de Cancelación:</span> Recibe un
          reembolso total si cancelas hasta 24 horas antes de la reserva. Al
          hacer clic en el botón, aceptas nuestros términos de servicio.
        </p>
      </div>

      {/* CTA Button */}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <LockClosedIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
        )}
        {loading ? 'Procesando...' : `Confirmar y Pagar ${formatCurrency(amount)}`}
      </button>

      {/* Powered by Stripe */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Powered by
        </span>
        <svg viewBox="0 0 60 25" className="h-6 opacity-40" fill="currentColor">
          <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.3 10.3 0 01-4.56.97c-4.31 0-6.83-2.88-6.83-7.17 0-4.01 2.29-7.19 6.2-7.19 3.91 0 5.99 3.18 5.99 7.17v1.3zm-4.14-4.78c0-1.34-.63-2.84-2.2-2.84-1.5 0-2.35 1.42-2.48 2.84h4.68zm-9.92-3.58h4.14v13.93h-4.14V5.92zm-6.65 0L39.1 6c-.3-.07-.65-.1-1.02-.1-1.73 0-2.88.91-3.26 2.41l-.17-.82h-3.94v12.36h4.14V12.9c0-2.13 1.16-2.73 2.47-2.73.47 0 .9.06 1.16.14V5.92zm-12.69-.2c-1.2 0-2.16.57-2.68 1.42l-.13-1.22H19.6v17.9l4.04-.85V19.3c.5.36 1.26.58 2.1.58 3.82 0 5.91-3 5.91-7.15 0-3.7-2-6.98-5.61-6.98zm-.83 10.73c-.73 0-1.32-.26-1.66-.71V10c.36-.49.96-.78 1.69-.78 1.34 0 2.26 1.49 2.26 3.3 0 1.85-.88 3.36-2.3 3.36zM17.67 5.92h4.14v13.93h-4.14V5.92zm0-3.84l4.14-.88v3.18h-4.14V2.08zM13.3 6.88l-.25-.96H9.39v13.93h4.14v-9.48c.97-1.27 2.62-1.03 3.13-.85V5.92c-.54-.2-2.39-.57-3.37.96zM5.22 1.41l-4.04.85-.01 12.75c0 2.36 1.77 4.09 4.13 4.09 1.3 0 2.26-.24 2.79-.53v-3.21c-.5.2-5-.93-5-3.14V9.56h5V5.92h-5V1.41l2.13-.5z" />
        </svg>
      </div>
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
      <div className="text-center py-12 text-[var(--on-surface-variant)]">
        Reserva no encontrada
      </div>
    );

  // Already paid or completed
  if (
    reservation.payment?.status === 'COMPLETED' ||
    reservation.status === 'CONFIRMED' ||
    reservation.status === 'COMPLETED'
  ) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--on-surface)] tracking-tight">
          Reserva Confirmada
        </h1>
        <p className="text-[var(--on-surface-variant)]">
          Esta reserva ya ha sido pagada y confirmada exitosamente.
        </p>
        <Link href={`/reservations/${id}`}>
          <Button>Ver Detalle de Reserva</Button>
        </Link>
      </div>
    );
  }

  // Cancelled
  if (reservation.status === 'CANCELLED') {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
          <XCircleIcon className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--on-surface)] tracking-tight">
          Reserva Cancelada
        </h1>
        <p className="text-[var(--on-surface-variant)]">
          No se puede procesar el pago de una reserva cancelada.
        </p>
        <Link href="/reservations">
          <Button variant="secondary">Volver a Reservas</Button>
        </Link>
      </div>
    );
  }

  /* ─── Price calculations ─── */
  const hours =
    (new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) /
    (1000 * 60 * 60);
  const pricePerHour = reservation.resource?.pricePerHour || 0;
  const subtotal = pricePerHour * hours;
  const serviceFee = reservation.totalAmount - subtotal;
  const resourceType = reservation.resource?.type || 'OTHER';
  const gradient = typeGradients[resourceType] || typeGradients.OTHER;
  const icon = typeIcons[resourceType] || '📦';

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/reservations/${id}`}
        className="inline-flex items-center gap-2 text-sm text-[var(--on-surface-variant)] font-medium hover:text-[var(--primary)] transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a detalles del espacio
      </Link>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ─── Left Column: Order Summary ─── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-blue-900/5">
            {/* Resource Image */}
            <div className="aspect-video w-full relative">
              {reservation.resource?.imageUrl ? (
                <img
                  alt={reservation.resource.name}
                  className="w-full h-full object-cover"
                  src={reservation.resource.imageUrl}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-6xl`}
                >
                  {icon}
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
                Premium Space
              </div>
            </div>

            {/* Summary Content */}
            <div className="p-8">
              <h2 className="text-2xl font-extrabold text-[var(--on-surface)] tracking-tight mb-2">
                {reservation.resource?.name || 'Recurso'}
              </h2>
              {reservation.resource?.location && (
                <div className="flex items-center text-[var(--outline)] mb-6">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{reservation.resource.location}</span>
                </div>
              )}

              {/* Date & Time */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <CalendarDaysIcon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--outline)] uppercase tracking-widest">
                      Fecha y Hora
                    </p>
                    <p className="text-[var(--on-surface)] font-semibold">
                      {new Date(reservation.startTime).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-[var(--outline)] text-sm">
                      {new Date(reservation.startTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(reservation.endTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' '}({getDurationLabel(reservation.startTime, reservation.endTime)})
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-10 space-y-3 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--outline)]">
                    Subtotal ({hours === Math.floor(hours) ? hours : hours.toFixed(1)} hrs × {formatCurrency(pricePerHour)})
                  </span>
                  <span className="text-[var(--on-surface)] font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--outline)]">Service Fee</span>
                    <span className="text-[var(--on-surface)] font-medium">
                      {formatCurrency(serviceFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-dashed border-slate-100">
                  <span className="text-lg font-bold text-[var(--on-surface)]">Total</span>
                  <span className="text-2xl font-extrabold text-[var(--primary)]">
                    {formatCurrency(reservation.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 p-4 bg-[var(--surface-container-low)] rounded-xl">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all">
              <ShieldCheckIcon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Secure Payment
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all">
              <CheckBadgeIcon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Quality Guaranteed
              </span>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Payment Form ─── */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,40,142,0.05)]">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-3xl font-extrabold text-[var(--on-surface)] tracking-tight">
                Método de Pago
              </h1>
              {/* Card brand icons */}
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  VISA
                </div>
                <div className="w-10 h-6 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  MC
                </div>
              </div>
            </div>

            {paymentError ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
                <XCircleIcon className="h-5 w-5 shrink-0" />
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
                      colorPrimary: '#00288e',
                      colorBackground: '#f8fafc',
                      colorText: '#0b1c30',
                      borderRadius: '12px',
                      fontFamily: 'Manrope, Inter, system-ui, sans-serif',
                      spacingUnit: '4px',
                    },
                    rules: {
                      '.Input': {
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                      },
                      '.Input:focus': {
                        boxShadow: '0 0 0 2px rgba(0,40,142,0.2)',
                        backgroundColor: '#ffffff',
                      },
                      '.Label': {
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#94a3b8',
                        marginBottom: '8px',
                      },
                      '.Tab': {
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#f8fafc',
                      },
                      '.Tab--selected': {
                        backgroundColor: '#00288e',
                        color: '#ffffff',
                      },
                    },
                  },
                }}
              >
                <CheckoutForm amount={reservation.totalAmount} reservationId={id} />
              </Elements>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-8 w-8 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                <p className="text-sm text-[var(--outline)]">
                  Preparando formulario de pago...
                </p>
              </div>
            )}
          </div>

          {/* Bottom security note */}
          <div className="mt-6 px-4 flex justify-between items-center text-sm text-[var(--outline)]">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="h-4 w-4" />
              <span className="text-xs">Tus datos están encriptados</span>
            </div>
            <Link
              href="/reservations"
              className="text-xs underline underline-offset-4 decoration-slate-200 hover:text-[var(--primary)] transition-colors"
            >
              ¿Necesitas ayuda?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
