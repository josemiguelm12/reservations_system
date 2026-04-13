'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useResource, useResourceSlots, useCreateReservation, useResourceReviews } from '@/hooks/use-api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form-fields';
import { LoadingSpinner, FullPageLoader } from '@/components/ui/loading-spinner';
import { formatCurrency, getResourceTypeLabel, getResourceTypeEmoji } from '@/lib/utils';
import {
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowLeftIcon,
  WifiIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';

/* ─── Amenity map for resource types ─── */
const AMENITY_ICONS: Record<string, { icon: typeof WifiIcon; label: string }[]> = {
  MEETING_ROOM: [
    { icon: WifiIcon, label: 'WiFi de alta velocidad' },
    { icon: ComputerDesktopIcon, label: 'Proyector 4K' },
    { icon: SparklesIcon, label: 'Climatización' },
    { icon: PrinterIcon, label: 'Impresión' },
  ],
  DESK: [
    { icon: WifiIcon, label: 'WiFi dedicado' },
    { icon: ComputerDesktopIcon, label: 'Monitor externo' },
    { icon: SparklesIcon, label: 'Ergonómico' },
  ],
  DEFAULT: [
    { icon: WifiIcon, label: 'WiFi incluido' },
    { icon: SparklesIcon, label: 'Limpieza' },
  ],
};

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: resource, isLoading } = useResource(id);
  const { data: reviewsData } = useResourceReviews(id);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [notes, setNotes] = useState('');

  const { data: bookedSlots, isLoading: slotsLoading } = useResourceSlots(id, selectedDate);
  const createReservation = useCreateReservation();

  if (isLoading) return <FullPageLoader />;
  if (!resource) return <div className="text-center py-12 text-[var(--on-surface-variant)]">Recurso no encontrado</div>;

  const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
  const selectedDayOfWeek = DAYS_OF_WEEK[new Date(selectedDate + 'T12:00:00').getDay()];
  const todaySchedule = resource.schedules?.find((s) => s.dayOfWeek === selectedDayOfWeek && s.isActive);

  const startHour = todaySchedule ? parseInt(todaySchedule.startTime.split(':')[0]) : 8;
  const endHour = todaySchedule ? parseInt(todaySchedule.endTime.split(':')[0]) : 22;
  const generatedSlots = Array.from({ length: Math.max(0, endHour - startHour) }, (_, i) => {
    const h = startHour + i;
    const slotStart = new Date(`${selectedDate}T00:00:00`);
    slotStart.setHours(h, 0, 0, 0);
    const slotEnd = new Date(`${selectedDate}T00:00:00`);
    slotEnd.setHours(h + 1, 0, 0, 0);
    const isBooked = (bookedSlots ?? []).some(
      (b) => new Date(b.startTime) < slotEnd && new Date(b.endTime) > slotStart,
    );
    return { startTime: slotStart.toISOString(), endTime: slotEnd.toISOString(), available: !isBooked };
  });

  const handleReserve = async () => {
    if (!selectedSlot) return;
    if (!user) {
      router.push(`/login?from=/resources/${id}`);
      return;
    }
    try {
      await createReservation.mutateAsync({
        resourceId: id,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        notes: notes || undefined,
      });
      router.push('/reservations');
    } catch {
      // error handled by hook
    }
  };

  const avgRating = resource.avgRating ?? reviewsData?.avgRating ?? 0;
  const reviewCount = resource.reviewCount ?? resource._count?.reviews ?? reviewsData?.total ?? 0;
  const amenities = AMENITY_ICONS[resource.type] || AMENITY_ICONS.DEFAULT;

  // Build rating distribution for the bar chart
  const ratingDistribution = [0, 0, 0, 0, 0]; // indices 0-4 = stars 1-5
  reviewsData?.reviews?.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) ratingDistribution[r.rating - 1]++;
  });
  const maxRatingCount = Math.max(...ratingDistribution, 1);

  // Total estimated cost
  const estimatedTotal = selectedSlot
    ? (resource.pricePerHour *
        (new Date(selectedSlot.end).getTime() - new Date(selectedSlot.start).getTime())) /
      3600000
    : 0;
  const serviceFee = estimatedTotal * 0.1;

  return (
    <div className="space-y-0 animate-fade-in">
      {/* ── Back navigation ── */}
      <div className="mb-6">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors font-bold"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a Recursos
        </Link>
      </div>

      {/* ══════════ HERO SECTION ══════════ */}
      <div className="relative w-full h-[420px] lg:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-[var(--shadow-xl)]">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary-fixed)] via-[var(--surface-container)] to-[var(--tertiary-fixed)] flex items-center justify-center">
            <span className="text-[120px] drop-shadow-lg">{getResourceTypeEmoji(resource.type)}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--on-background)]/60 via-transparent to-transparent flex items-end p-8 lg:p-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)] text-white text-xs font-bold uppercase tracking-widest mb-4">
              <SparklesIcon className="h-3.5 w-3.5" />
              {getResourceTypeLabel(resource.type)}
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tighter leading-none mb-3">
              {resource.name}
            </h1>
            {resource.location && (
              <p className="text-white/80 flex items-center gap-2 font-medium">
                <MapPinIcon className="h-5 w-5 text-white" />
                {resource.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ TWO-COLUMN LAYOUT ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start">

        {/* ── LEFT COLUMN (70%) ── */}
        <div className="lg:col-span-7 space-y-12">

          {/* ─── About Section ─── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[var(--primary)]">
                Sobre este espacio
              </h2>
              {avgRating > 0 && (
                <div className="flex items-center gap-1.5 text-[var(--on-surface-variant)] font-semibold">
                  <StarIcon className="h-5 w-5 text-[var(--secondary)]" />
                  <span>{avgRating.toFixed(1)}</span>
                  <span className="text-[var(--outline)] text-sm font-normal">
                    ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>
              )}
            </div>
            <p className="text-[var(--on-surface-variant)] leading-relaxed text-lg">
              {resource.description || 'Un espacio cuidadosamente diseñado para ofrecer la mejor experiencia. Reserva ahora y descubre todo lo que tiene para ofrecer.'}
            </p>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-4 text-sm text-[var(--on-surface-variant)]">
              {resource.capacity && (
                <span className="flex items-center gap-1.5">
                  <UserGroupIcon className="h-4 w-4 text-[var(--primary)]" />
                  Capacidad: {resource.capacity} personas
                </span>
              )}
              {resource.isActive && (
                <span className="inline-flex items-center gap-1.5 text-[var(--secondary)] font-semibold">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Disponible
                </span>
              )}
            </div>
          </section>

          {/* ─── Amenities ─── */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--on-background)]">Comodidades</h3>
            <div className="flex flex-wrap gap-3">
              {amenities.map((amenity, i) => {
                const Icon = amenity.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--surface-container-low)] border border-transparent hover:border-[var(--primary-container)] transition-all group cursor-default"
                  >
                    <Icon className="h-5 w-5 text-[var(--primary)] group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-[var(--on-surface-variant)]">{amenity.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── Partner Card ─── */}
          {resource.owner && (
            <section className="p-8 bg-[var(--surface-container-low)] rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {resource.owner.fullName?.[0] || 'S'}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[var(--secondary)] text-white p-1 rounded-lg">
                    <CheckBadgeIcon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--on-background)]">
                    {resource.owner.partnerProfile?.businessName || resource.owner.fullName}
                  </h4>
                  <p className="text-[var(--on-surface-variant)] font-medium">Socio Verificado</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-tighter">
                      Respuesta Rápida
                    </span>
                    <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-tighter">
                      Socio Premium
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="md">
                Contactar Socio
              </Button>
            </section>
          )}

          {/* ─── Reviews Section ─── */}
          {reviewCount > 0 && (
            <section className="space-y-8">
              {/* Rating summary with bars */}
              <div className="flex items-end gap-12">
                <div className="text-center">
                  <span className="text-6xl font-black text-[var(--primary)] leading-none tracking-tighter">
                    {avgRating.toFixed(1)}
                  </span>
                  <div className="flex justify-center gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(avgRating) ? 'text-[var(--secondary)]' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[var(--outline)] text-xs font-bold mt-2 uppercase">
                    {reviewCount} Opiniones
                  </p>
                </div>

                {/* Distribution bars */}
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDistribution[star - 1];
                    const pct = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <span className="text-xs font-bold w-4">{star}</span>
                        <div className="h-2 flex-1 bg-[var(--surface-container)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--secondary)] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual reviews */}
              <div className="space-y-4">
                {reviewsData?.reviews?.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 bg-[var(--surface-container-lowest)] rounded-2xl shadow-[var(--shadow-xs)] border border-[var(--surface-container)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-fixed-dim)] to-[var(--primary-fixed)] flex items-center justify-center text-sm font-bold text-[var(--on-primary-fixed)]">
                          {review.user?.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[var(--on-surface)]">
                            {review.user?.fullName || 'Usuario'}
                          </p>
                          <p className="text-[var(--outline)] text-xs">
                            {new Date(review.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'text-[var(--secondary)]' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-[var(--on-surface-variant)] italic leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT COLUMN (30% - Sticky Booking Panel) ── */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24">
          <div className="bg-[var(--surface-container-lowest)] rounded-3xl p-8 shadow-[var(--shadow-xl)] border border-[var(--surface-container-high)]">

            {/* Price header */}
            <div className="flex items-baseline justify-between mb-8">
              <span className="text-2xl font-black text-[var(--primary)]">
                {formatCurrency(resource.pricePerHour)}
              </span>
              <span className="text-[var(--on-surface-variant)] text-sm font-semibold uppercase tracking-widest">
                / hora
              </span>
            </div>

            {/* Date picker */}
            <div className="mb-6">
              <p className="font-bold text-sm mb-3 text-[var(--on-surface)]">Selecciona fecha</p>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm font-medium"
              />
            </div>

            {/* Time slots */}
            <div className="space-y-3 mb-8">
              <p className="font-bold text-sm text-[var(--on-surface)]">Horarios Disponibles</p>
              {slotsLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : generatedSlots.length === 0 ? (
                <p className="text-sm text-[var(--on-surface-variant)] py-4 text-center">
                  No hay horarios disponibles para esta fecha
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {generatedSlots.map((slot, i) => {
                    const startStr = new Date(slot.startTime).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const endStr = new Date(slot.endTime).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const isSelected =
                      selectedSlot?.start === slot.startTime &&
                      selectedSlot?.end === slot.endTime;

                    return (
                      <button
                        key={i}
                        disabled={!slot.available}
                        onClick={() =>
                          setSelectedSlot({
                            start: slot.startTime,
                            end: slot.endTime,
                          })
                        }
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !slot.available
                            ? 'border border-[var(--outline-variant)] text-[var(--outline-variant)] opacity-40 cursor-not-allowed line-through'
                            : isSelected
                              ? 'bg-[var(--primary)] text-white border border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20'
                              : 'border border-[var(--outline-variant)] text-[var(--on-surface)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                        }`}
                      >
                        <ClockIcon className="inline h-3 w-3 mr-1" />
                        {startStr} – {endStr}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            {user && (
              <div className="mb-6">
                <Textarea
                  label="Notas (opcional)"
                  placeholder="Agrega comentarios sobre tu reserva..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}

            {/* Price breakdown */}
            {selectedSlot && (
              <div className="space-y-3 pt-6 border-t border-[var(--surface-container-high)] mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--on-surface-variant)]">
                    Reserva (
                    {Math.round(
                      (new Date(selectedSlot.end).getTime() - new Date(selectedSlot.start).getTime()) /
                        3600000,
                    )}{' '}
                    hora)
                  </span>
                  <span className="font-bold">{formatCurrency(estimatedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--on-surface-variant)]">Tarifa de Servicio</span>
                  <span className="font-bold">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-[var(--surface-container-high)]">
                  <span className="font-extrabold text-[var(--primary)]">Total</span>
                  <span className="font-black text-[var(--primary)]">
                    {formatCurrency(estimatedTotal + serviceFee)}
                  </span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleReserve}
              disabled={!selectedSlot || createReservation.isPending}
              className="w-full py-5 bg-[var(--primary)] text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              {createReservation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : user ? (
                'Reservar ahora'
              ) : (
                'Iniciar Sesión para Reservar'
              )}
            </button>

            <p className="text-center text-[10px] text-[var(--outline)] font-bold uppercase tracking-widest mt-6">
              Cancelación gratuita hasta 24h antes
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
