'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form-fields';
import { FullPageLoader, LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import {
  useCreateReservation,
  useResource,
  useResourceReviews,
  useResourceSlots,
} from '@/hooks/use-api';
import type { ResourceType } from '@/lib/types';
import { cn, formatCurrency, getResourceTypeEmoji, getResourceTypeLabel } from '@/lib/utils';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
  WifiIcon,
  ComputerDesktopIcon,
  PrinterIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon, StarIcon } from '@heroicons/react/24/solid';

const AMENITY_ICONS: Record<string, { icon: typeof WifiIcon; label: string }[]> = {
  ROOM: [
    { icon: WifiIcon, label: 'WiFi de alta velocidad' },
    { icon: ComputerDesktopIcon, label: 'Pantalla para presentaciones' },
    { icon: SparklesIcon, label: 'Ambiente climatizado' },
    { icon: PrinterIcon, label: 'Soporte operativo' },
  ],
  DESK: [
    { icon: WifiIcon, label: 'Conexion dedicada' },
    { icon: ComputerDesktopIcon, label: 'Area lista para trabajar' },
    { icon: SparklesIcon, label: 'Mobiliario ergonomico' },
  ],
  COURT: [
    { icon: SparklesIcon, label: 'Mantenimiento continuo' },
    { icon: ClockIcon, label: 'Bloques por hora' },
    { icon: ShieldCheckIcon, label: 'Acceso controlado' },
  ],
  DEFAULT: [
    { icon: WifiIcon, label: 'Conectividad incluida' },
    { icon: SparklesIcon, label: 'Mantenimiento frecuente' },
    { icon: ShieldCheckIcon, label: 'Operacion verificada' },
  ],
};

const DAYS_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

const SNAPSHOT_ICONS: Record<ResourceType, typeof BuildingOffice2Icon> = {
  COURT: SparklesIcon,
  ROOM: BuildingOffice2Icon,
  TABLE: UserGroupIcon,
  DESK: ComputerDesktopIcon,
  EQUIPMENT: BriefcaseIcon,
  OTHER: CheckBadgeIcon,
};

function formatSlotLabel(value: string) {
  return new Date(value).toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatHumanDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-DO', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: resource, isLoading } = useResource(id);
  const { data: reviewsData } = useResourceReviews(id);

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [notes, setNotes] = useState('');

  const { data: bookedSlots, isLoading: slotsLoading } = useResourceSlots(id, selectedDate);
  const createReservation = useCreateReservation();

  if (isLoading) return <FullPageLoader />;
  if (!resource) {
    return (
      <div className="py-16 text-center text-sm text-[var(--on-surface-variant)]">
        Recurso no encontrado.
      </div>
    );
  }

  const selectedDayOfWeek = DAYS_OF_WEEK[new Date(`${selectedDate}T12:00:00`).getDay()];
  const todaySchedule = resource.schedules?.find(
    (schedule) => schedule.dayOfWeek === selectedDayOfWeek && schedule.isActive,
  );

  const startHour = todaySchedule ? parseInt(todaySchedule.startTime.split(':')[0], 10) : 8;
  const endHour = todaySchedule ? parseInt(todaySchedule.endTime.split(':')[0], 10) : 22;
  const generatedSlots = Array.from({ length: Math.max(0, endHour - startHour) }, (_, index) => {
    const hour = startHour + index;
    const slotStart = new Date(`${selectedDate}T00:00:00`);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(`${selectedDate}T00:00:00`);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    const isBooked = (bookedSlots ?? []).some(
      (bookedSlot) =>
        new Date(bookedSlot.startTime) < slotEnd && new Date(bookedSlot.endTime) > slotStart,
    );

    return {
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      available: !isBooked,
    };
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
      // handled by mutation hook
    }
  };

  const avgRating = resource.avgRating ?? reviewsData?.avgRating ?? 0;
  const reviewCount = resource.reviewCount ?? resource._count?.reviews ?? reviewsData?.total ?? 0;
  const amenities = resource.amenities?.length
    ? resource.amenities.map((label, index) => ({
        icon: AMENITY_ICONS[resource.type]?.[index % (AMENITY_ICONS[resource.type]?.length || 1)]?.icon || WifiIcon,
        label,
      }))
    : AMENITY_ICONS[resource.type] || AMENITY_ICONS.DEFAULT;

  const ratingDistribution = [0, 0, 0, 0, 0];
  reviewsData?.reviews?.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating - 1] += 1;
    }
  });
  const maxRatingCount = Math.max(...ratingDistribution, 1);

  const estimatedTotal = selectedSlot
    ? (resource.pricePerHour *
        (new Date(selectedSlot.end).getTime() - new Date(selectedSlot.start).getTime())) /
      3600000
    : 0;
  const serviceFee = estimatedTotal * 0.1;
  const hostName = resource.owner?.partnerProfile?.businessName || resource.owner?.fullName || 'Socio';

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-5">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a recursos
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--outline)]">
          <Link href="/resources" className="transition-colors hover:text-[var(--primary)]">
            Recursos
          </Link>
          <span>/</span>
          <span>{getResourceTypeLabel(resource.type)}</span>
          <span>/</span>
          <span className="text-[var(--on-surface)]">{resource.name}</span>
        </div>

        <div className="space-y-4">
          <h1 className="max-w-4xl font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-[-0.04em] text-[var(--on-surface)] md:text-6xl">
            {resource.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--on-surface-variant)]">
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5">
                <StarIcon className="h-4 w-4 text-[var(--tertiary)]" />
                <span className="font-semibold text-[var(--on-surface)]">{avgRating.toFixed(1)}</span>
                <span>({reviewCount} resenas)</span>
              </div>
            )}

            {resource.location && (
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" />
                <span>{resource.location}</span>
              </div>
            )}

            {resource.capacity > 0 && (
              <div className="flex items-center gap-1.5">
                <UserGroupIcon className="h-4 w-4" />
                <span>Hasta {resource.capacity} personas</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--surface-container-high)] lg:col-span-2">
          {resource.imageUrl ? (
            <img
              src={resource.imageUrl}
              alt={resource.name}
              className="h-[360px] w-full object-cover md:h-[520px]"
            />
          ) : (
            <div className="flex h-[360px] items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] md:h-[520px]">
              <span className="text-8xl">{getResourceTypeEmoji(resource.type)}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--on-background)]/80 via-[var(--on-background)]/25 to-transparent p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              <SparklesIcon className="h-4 w-4" />
              Curado para reservas premium
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[2rem] bg-[var(--surface-container-low)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--outline)]">
                Snapshot
              </span>
              {(() => {
                const SnapshotIcon = SNAPSHOT_ICONS[resource.type] || CheckBadgeIcon;
                return <SnapshotIcon className="h-12 w-12 text-[var(--primary)]" />;
              })()}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--on-surface-variant)]">Categoria</p>
                <p className="text-xl font-bold text-[var(--on-surface)]">
                  {getResourceTypeLabel(resource.type)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--on-surface-variant)]">Estado</p>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--secondary)]">
                  <ShieldCheckIcon className="h-4 w-4" />
                  {resource.isActive ? 'Disponible para reservar' : 'Temporalmente inactivo'}
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--on-surface-variant)]">Horario del dia</p>
                <p className="text-sm font-semibold text-[var(--on-surface)]">
                  {todaySchedule
                    ? `${todaySchedule.startTime.slice(0, 5)} - ${todaySchedule.endTime.slice(0, 5)}`
                    : 'Sin horario configurado'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-6 shadow-[0_16px_40px_rgba(11,28,48,0.06)]">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] text-lg font-bold text-white">
                {hostName[0]}
              </div>
              <div>
                <p className="text-sm text-[var(--on-surface-variant)]">Operado por</p>
                <p className="font-bold text-[var(--on-surface)]">{hostName}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[var(--on-surface-variant)]">
              <p className="inline-flex items-center gap-2 font-medium text-[var(--on-surface)]">
                <CheckBadgeIcon className="h-5 w-5 text-[var(--tertiary)]" />
                Perfil verificado
              </p>
              <p>Respuesta prioritaria y soporte para coordinacion de reservas.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-10">
          <section className="rounded-[2rem] bg-[var(--surface-container-low)] p-8 md:p-10">
            <h2 className="mb-4 font-[family-name:var(--font-manrope)] text-2xl font-bold text-[var(--on-surface)] md:text-3xl">
              Sobre este espacio
            </h2>
            <div className="space-y-4 text-[15px] leading-8 text-[var(--on-surface-variant)]">
              <p>
                {resource.description ||
                  'Este recurso fue preparado para ofrecer una experiencia clara, eficiente y lista para recibir reservas con una operacion confiable.'}
              </p>
              <p>
                La composicion sigue una experiencia mas editorial: informacion directa, capas tonales y una lectura rapida para decidir disponibilidad y reservar.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-[family-name:var(--font-manrope)] text-2xl font-bold text-[var(--on-surface)]">
                Premium amenities
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--outline)]">
                Sin separadores rigidos
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div
                    key={`${amenity.label}-${index}`}
                    className="inline-flex items-center gap-3 rounded-2xl bg-[var(--surface-container-high)] px-4 py-3 text-sm font-medium text-[var(--on-surface)]"
                  >
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                    <span>{amenity.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {resource.owner && (
            <section className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-8 shadow-[0_20px_40px_rgba(11,28,48,0.06)]">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-fixed)] to-[var(--primary-fixed-dim)] text-2xl font-bold text-[var(--on-primary-fixed)]">
                  {hostName[0]}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-bold text-[var(--on-surface)]">
                      {hostName}
                    </h3>
                    <p className="text-sm text-[var(--on-surface-variant)]">
                      Socio verificado para reservas con coordinacion directa.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="inline-flex items-center gap-2 text-[var(--on-surface)]">
                      <StarIcon className="h-4 w-4 text-[var(--tertiary)]" />
                      {avgRating > 0 ? `${avgRating.toFixed(1)} de satisfaccion` : 'Calidad validada'}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[var(--on-surface-variant)]">
                      <BuildingOffice2Icon className="h-4 w-4" />
                      Operacion profesional
                    </span>
                  </div>

                  <p className="max-w-2xl text-sm leading-7 text-[var(--on-surface-variant)]">
                    Este socio administra el recurso con una logica de disponibilidad clara, respuesta rapida y una presentacion consistente con el flujo de reservas.
                  </p>

                  <Button variant="outline" size="md">
                    Contactar socio
                  </Button>
                </div>
              </div>
            </section>
          )}

          {reviewCount > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col gap-6 rounded-[2rem] bg-[var(--surface-container-low)] p-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--outline)]">
                    Valoracion
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="font-[family-name:var(--font-manrope)] text-6xl font-extrabold tracking-[-0.05em] text-[var(--primary)]">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="pb-2 text-sm text-[var(--on-surface-variant)]">
                      {reviewCount} resenas verificadas
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-xl space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDistribution[star - 1];
                    const width = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-4 text-xs font-semibold text-[var(--on-surface)]">{star}</span>
                        <div className="h-2 flex-1 rounded-full bg-[var(--surface-container-high)]">
                          <div
                            className="h-2 rounded-full bg-[var(--secondary)]"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {reviewsData?.reviews?.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-[1.5rem] bg-[var(--surface-container-lowest)] p-6 shadow-[0_14px_34px_rgba(11,28,48,0.05)]"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-container-high)] font-semibold text-[var(--primary)]">
                          {review.user?.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--on-surface)]">
                            {review.user?.fullName || 'Usuario'}
                          </p>
                          <p className="text-xs text-[var(--outline)]">
                            {new Date(review.createdAt).toLocaleDateString('es-DO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <StarIcon
                            key={index}
                            className={cn(
                              'h-4 w-4',
                              index < review.rating ? 'text-[var(--tertiary)]' : 'text-slate-300',
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-sm leading-7 text-[var(--on-surface-variant)]">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="w-full lg:max-w-[360px] lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-6 shadow-[0_24px_50px_rgba(11,28,48,0.08)]">
              <div className="mb-6 border-b border-[color:rgba(196,197,213,0.35)] pb-5">
                <div className="flex items-end gap-2">
                  <span className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-[-0.04em] text-[var(--on-surface)]">
                    {formatCurrency(resource.pricePerHour)}
                  </span>
                  <span className="pb-1 text-sm text-[var(--on-surface-variant)]">/ hora</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--on-surface)]">Selecciona fecha</span>
                    <CalendarDaysIcon className="h-5 w-5 text-[var(--on-surface-variant)]" />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setSelectedSlot(null);
                    }}
                    className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-[var(--on-surface)] outline-none ring-0"
                  />
                  <p className="mt-2 text-xs text-[var(--on-surface-variant)]">{formatHumanDate(selectedDate)}</p>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--on-surface)]">Selecciona horario</h3>
                    <span className="text-xs text-[var(--on-surface-variant)]">Bloques de 1 hora</span>
                  </div>

                  {slotsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : generatedSlots.length === 0 ? (
                    <div className="rounded-2xl bg-[var(--surface-container-low)] px-4 py-5 text-sm text-[var(--on-surface-variant)]">
                      No hay horarios disponibles para la fecha seleccionada.
                    </div>
                  ) : (
                    <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
                      {generatedSlots.map((slot) => {
                        const isSelected =
                          selectedSlot?.start === slot.startTime && selectedSlot?.end === slot.endTime;

                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            disabled={!slot.available}
                            onClick={() =>
                              setSelectedSlot({
                                start: slot.startTime,
                                end: slot.endTime,
                              })
                            }
                            className={cn(
                              'rounded-xl px-3 py-3 text-left text-xs font-semibold transition-all',
                              !slot.available &&
                                'cursor-not-allowed bg-[var(--surface-container-low)] text-[var(--outline)] opacity-50 line-through',
                              slot.available &&
                                !isSelected &&
                                'bg-[var(--surface-container-low)] text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]',
                              isSelected &&
                                'bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)] shadow-sm',
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-3.5 w-3.5" />
                              <span>{formatSlotLabel(slot.startTime)}</span>
                            </div>
                            <p className="mt-1 text-[11px] opacity-80">{formatSlotLabel(slot.endTime)}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {user && (
                  <Textarea
                    label="Notas opcionales"
                    placeholder="Agrega detalles para tu reserva..."
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                )}

                {selectedSlot && (
                  <div className="space-y-3 rounded-2xl bg-[var(--surface-container-low)] p-4 text-sm">
                    <div className="flex items-center justify-between text-[var(--on-surface-variant)]">
                      <span>Reserva ({formatSlotLabel(selectedSlot.start)} - {formatSlotLabel(selectedSlot.end)})</span>
                      <span className="font-semibold text-[var(--on-surface)]">
                        {formatCurrency(estimatedTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--on-surface-variant)]">
                      <span>Tarifa de servicio</span>
                      <span className="font-semibold text-[var(--on-surface)]">
                        {formatCurrency(serviceFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[color:rgba(196,197,213,0.35)] pt-3">
                      <span className="font-semibold text-[var(--on-surface)]">Total</span>
                      <span className="font-[family-name:var(--font-manrope)] text-xl font-extrabold text-[var(--primary)]">
                        {formatCurrency(estimatedTotal + serviceFee)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleReserve}
                  disabled={!selectedSlot || createReservation.isPending}
                  fullWidth
                  size="lg"
                  className="justify-center"
                >
                  {createReservation.isPending
                    ? 'Procesando...'
                    : user
                      ? 'Solicitar reserva'
                      : 'Inicia sesion para reservar'}
                </Button>

                <p className="text-center text-xs text-[var(--on-surface-variant)]">
                  No se realiza cobro hasta confirmar la reserva.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
