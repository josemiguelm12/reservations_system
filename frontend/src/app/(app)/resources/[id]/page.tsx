'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useResource, useResourceSlots, useCreateReservation } from '@/hooks/use-api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form-fields';
import { LoadingSpinner, FullPageLoader } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getResourceTypeLabel, getResourceTypeEmoji } from '@/lib/utils';
import { FiMapPin, FiUsers, FiClock, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: resource, isLoading } = useResource(id);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    // Use local date, not UTC (toISOString gives UTC which can be the wrong day)
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
  if (!resource) return <div className="text-center py-12 text-[var(--text-muted)]">Recurso no encontrado</div>;

  // Determine schedule for selected day
  const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
  const selectedDayOfWeek = DAYS_OF_WEEK[new Date(selectedDate + 'T12:00:00').getDay()];
  const todaySchedule = resource.schedules?.find((s) => s.dayOfWeek === selectedDayOfWeek && s.isActive);

  // Generate 1-hour time slots for the day (from schedule or default 8-22)
  const startHour = todaySchedule ? parseInt(todaySchedule.startTime.split(':')[0]) : 8;
  const endHour = todaySchedule ? parseInt(todaySchedule.endTime.split(':')[0]) : 22;
  const generatedSlots = Array.from({ length: Math.max(0, endHour - startHour) }, (_, i) => {
    const h = startHour + i;
    // Use T00:00:00 (no Z) so it's parsed as LOCAL time, not UTC
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
    if (!selectedSlot || !user) return;
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

  return (
    <div className="space-y-6">
      <Link
        href="/resources"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <FiArrowLeft className="h-4 w-4" />
        Volver a Recursos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Resource info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-primary)]">
            {resource.imageUrl ? (
              <img src={resource.imageUrl} alt={resource.name} className="w-full h-64 object-cover" />
            ) : (
              <div className="h-64 bg-gradient-to-br from-[var(--brand)]/10 to-[var(--brand)]/5 flex items-center justify-center">
                <span className="text-7xl">{getResourceTypeEmoji(resource.type)}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{resource.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-secondary)]">
                  <Badge variant={resource.isActive ? 'success' : 'neutral'}>
                    {resource.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <span>{getResourceTypeLabel(resource.type)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[var(--brand)]">
                  {formatCurrency(resource.pricePerHour)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">por hora</p>
              </div>
            </div>

            <p className="mt-4 text-[var(--text-secondary)]">
              {resource.description || 'Sin descripción disponible.'}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--text-muted)]">
              {resource.location && (
                <span className="flex items-center gap-1">
                  <FiMapPin className="h-4 w-4" />
                  {resource.location}
                </span>
              )}
              {resource.capacity && (
                <span className="flex items-center gap-1">
                  <FiUsers className="h-4 w-4" />
                  Capacidad: {resource.capacity} personas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Reservation form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FiCalendar className="h-5 w-5" />
                Reservar
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {!user ? (
                <div className="text-center py-4">
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Inicia sesión para hacer una reserva
                  </p>
                  <Link href="/login">
                    <Button>Iniciar Sesión</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Date picker */}
                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">
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
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    />
                  </div>

                  {/* Time slots */}
                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">
                      Horarios disponibles
                    </label>
                    {slotsLoading ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : generatedSlots.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)] py-4 text-center">
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
                              className={`px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                                !slot.available
                                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-primary)] cursor-not-allowed line-through'
                                  : isSelected
                                    ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                                    : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:border-[var(--brand)]'
                              }`}
                            >
                              <FiClock className="inline h-3 w-3 mr-1" />
                              {startStr} - {endStr}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Textarea
                    label="Notas (opcional)"
                    placeholder="Agrega comentarios sobre tu reserva..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  {selectedSlot && (
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Total estimado</p>
                      <p className="text-lg font-bold text-[var(--brand)]">
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
                    Confirmar Reserva
                  </Button>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
