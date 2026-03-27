'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { getResourceTypeLabel, getResourceTypeEmoji, formatCurrency, formatDate } from '@/lib/utils';
import { FiHeart, FiUsers, FiMapPin, FiClock } from 'react-icons/fi';
import { useState } from 'react';
import type { Resource, Reservation } from '@/lib/types';

/* ─── ResourceCard (Airbnb-inspired) ─── */
interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  return (
    <div
      onClick={() => router.push(`/resources/${resource.id}`)}
      className="group cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03]">
            <span className="text-6xl filter drop-shadow-sm">{getResourceTypeEmoji(resource.type)}</span>
          </div>
        )}

        {/* Heart / save icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110 cursor-pointer shadow-sm"
        >
          <FiHeart
            className={`h-4 w-4 transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-gray-700'
            }`}
          />
        </button>

        {/* Type badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--foreground)] shadow-sm">
          {getResourceTypeLabel(resource.type)}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-[var(--foreground)] line-clamp-1">
            {resource.name}
          </h3>
          {resource.capacity > 0 && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] flex-shrink-0 mt-0.5">
              <FiUsers className="h-3 w-3" />
              {resource.capacity}
            </span>
          )}
        </div>

        {resource.location && (
          <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
            <FiMapPin className="h-3 w-3 flex-shrink-0" />
            {resource.location}
          </p>
        )}

        {resource.description && (
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
            {resource.description}
          </p>
        )}

        <p className="text-[15px] pt-1">
          <span className="font-bold text-[var(--foreground)]">{formatCurrency(resource.pricePerHour)}</span>
          <span className="text-[var(--muted-foreground)] font-normal"> / hour</span>
        </p>
      </div>
    </div>
  );
}

/* ─── ReservationCard (unchanged) ─── */
interface ReservationCardProps {
  reservation: Reservation;
  onClick?: () => void;
}

export function ReservationCard({ reservation, onClick }: ReservationCardProps) {
  return (
    <Card hover onClick={onClick}>
      <CardBody>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">
              {reservation.resource?.name || 'Recurso'}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {formatDate(reservation.startTime)}
            </p>
          </div>
          <StatusBadge status={reservation.status} />
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <FiClock className="h-3.5 w-3.5" />
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
          <span className="font-semibold text-[var(--primary)] text-sm">
            {formatCurrency(reservation.totalAmount)}
          </span>
        </div>
        {reservation.notes && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)] line-clamp-1">{reservation.notes}</p>
        )}
      </CardBody>
    </Card>
  );
}
