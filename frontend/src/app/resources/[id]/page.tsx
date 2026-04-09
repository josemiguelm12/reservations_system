'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useResource, useResourceSlots, useCreateReservation, useResourceReviews } from '@/hooks/use-api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form-fields';
import { LoadingSpinner, FullPageLoader } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getResourceTypeLabel, getResourceTypeEmoji } from '@/lib/utils';
import {
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

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

  return (
    <div className="space-y-8">
      <Link
        href="/resources"
        className="inline-flex items-center gap-1 text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors font-bold"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a Recursos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Resource info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="rounded-xl overflow-hidden">
            {resource.imageUrl ? (
              <img src={resource.imageUrl} alt={resource.name} className="w-full h-72 object-cover" />
            ) : (
              <div className="h-72 bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 flex items-center justify-center">
                <span className="text-8xl">{getResourceTypeEmoji(resource.type)}</span>
              </div>
            )}
          </div>

          {/* Info header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">{resource.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-[var(--on-surface-variant)]">
                  <Badge variant={resource.isActive ? 'success' : 'neutral'}>
                    {resource.isActive ? 'Disponible' : 'No disponible'}
                  </Badge>
                  <span>{getResourceTypeLabel(resource.type)}</span>
                  {avgRating > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      {avgRating.toFixed(1)}
                      <span className="text-[var(--on-surface-variant)] font-normal">
                        ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[var(--primary)]">
                  {formatCurrency(resource.pricePerHour)}
                </p>
                <p className="text-sm text-[var(--on-surface-variant)]">por hora</p>
              </div>
            </div>

            <p className="mt-4 text-[var(--on-surface-variant)] leading-relaxed">
              {resource.description || 'Sin descripción disponible.'}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--on-surface-variant)]">
              {resource.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  {resource.location}
                </span>
              )}
              {resource.capacity && (
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4" />
                  Capacidad: {resource.capacity} personas
                </span>
              )}
            </div>
          </div>

          {/* Partner info */}
          {resource.owner && (
            <div className="flex items-center gap-4 p-4 bg-[var(--surface-container-lowest)] rounded-xl">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {resource.owner.fullName?.[0] || 'S'}
              </div>
              <div>
                <p className="text-sm text-[var(--on-surface-variant)]">Ofrecido por</p>
                <p className="font-bold text-[var(--on-surface)]">
                  {resource.owner.partnerProfile?.businessName || resource.owner.fullName}
                </p>
                {resource.owner.partnerProfile?.description && (
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5 line-clamp-1">
                    {resource.owner.partnerProfile.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reviews section */}
          {(reviewsData?.reviews?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-[var(--on-surface)] flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                Reseñas ({reviewsData?.total})
              </h2>
              <div className="space-y-3">
                {reviewsData?.reviews?.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-[var(--surface-container-lowest)] rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-sm font-semibold text-[var(--on-surface)]">
                          {review.user?.fullName?.[0] || 'U'}
                        </div>
                        <span className="font-bold text-sm text-[var(--on-surface)]">
                          {review.user?.fullName || 'Usuario'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[var(--on-surface-variant)]">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Reservation form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-bold text-[var(--on-surface)] flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5" />
                Reservar
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Date picker */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-2 block">
                  Selecciona fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--surface-container-highest)] border-none text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Time slots */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-2 block">
                  Horarios disponibles
                </label>
                {slotsLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : generatedSlots.length === 0 ? (
                  <p className="text-sm text-[var(--on-surface-variant)] py-4 text-center">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
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
                          className={`px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer font-bold ${
                            !slot.available
                              ? 'bg-[var(--surface-container)] text-[var(--outline)] cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-md)]'
                                : 'bg-[var(--surface-container-lowest)] text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]'
                          }`}
                        >
                          <ClockIcon className="inline h-3 w-3 mr-1" />
                          {startStr} - {endStr}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {user && (
                <Textarea
                  label="Notas (opcional)"
                  placeholder="Agrega comentarios sobre tu reserva..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              )}

              {selectedSlot && (
                <div className="bg-[var(--surface-container-low)] rounded-lg p-3">
                  <p className="text-xs text-[var(--on-surface-variant)] mb-1">Total estimado</p>
                  <p className="text-lg font-black text-[var(--primary)]">
                    {formatCurrency(
                      (resource.pricePerHour *
                        (new Date(selectedSlot.end).getTime() -
                          new Date(selectedSlot.start).getTime())) /
                        3600000,
                    )}
                  </p>
                </div>
              )}

              <Button
                onClick={handleReserve}
                loading={createReservation.isPending}
                disabled={!selectedSlot}
                fullWidth
                size="lg"
              >
                {user ? 'Confirmar Reserva' : 'Iniciar Sesión para Reservar'}
              </Button>

              {!user && (
                <p className="text-xs text-center text-[var(--on-surface-variant)]">
                  Necesitas una cuenta para completar la reserva
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
