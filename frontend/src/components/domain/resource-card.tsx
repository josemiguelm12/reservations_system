'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { getResourceTypeLabel, getResourceTypeEmoji, formatCurrency, formatDate } from '@/lib/utils';
import {
  HeartIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import type { Resource, Reservation } from '@/lib/types';

/* ── Category gradient map ── */
const categoryGradients: Record<string, string> = {
  ROOM: 'from-blue-600 to-indigo-600',
  COURT: 'from-green-600 to-teal-600',
  DESK: 'from-orange-500 to-yellow-500',
  TABLE: 'from-pink-500 to-rose-600',
  EQUIPMENT: 'from-purple-600 to-violet-600',
  OTHER: 'from-slate-500 to-slate-700',
};

/* ─── ResourceCard (Stitch Precision Curator style) ─── */
interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const avgRating = resource.avgRating ?? 0;
  const reviewCount = resource.reviewCount ?? resource._count?.reviews ?? 0;
  const gradient = categoryGradients[resource.type] || categoryGradients.OTHER;

  return (
    <div
      onClick={() => router.push(`/resources/${resource.id}`)}
      className="group cursor-pointer bg-[var(--surface-container-lowest)] rounded-xl overflow-hidden hover:shadow-[var(--shadow-xl)] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <span className="text-6xl filter drop-shadow-sm">{getResourceTypeEmoji(resource.type)}</span>
          </div>
        )}

        {/* Category gradient badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 bg-gradient-to-r ${gradient} text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
            {getResourceTypeLabel(resource.type)}
          </span>
        </div>

        {/* Heart / save */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110 cursor-pointer shadow-sm"
        >
          {liked ? (
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-gray-700" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
            {resource.name}
          </h3>
          {avgRating > 0 && (
            <div className="flex items-center gap-1 text-[var(--on-surface)] flex-shrink-0">
              <StarSolidIcon className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs font-bold">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-[var(--on-surface-variant)] text-xs font-medium">
          {resource.capacity > 0 && (
            <div className="flex items-center gap-1">
              <UserGroupIcon className="h-3.5 w-3.5" />
              Capacidad: {resource.capacity} pers
            </div>
          )}
          {resource.location && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{resource.location}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[var(--surface-container)] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--on-surface-variant)] font-medium">Tarifa por hora</span>
            <span className="text-lg font-black text-[var(--primary)]">{formatCurrency(resource.pricePerHour)}/hr</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/resources/${resource.id}`);
            }}
            className="px-5 py-2.5 bg-[var(--surface-container-high)] text-[var(--primary)] font-bold text-xs rounded-lg hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer"
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ReservationCard ─── */
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
            <h3 className="font-bold text-[var(--on-surface)]">
              {reservation.resource?.name || 'Recurso'}
            </h3>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {formatDate(reservation.startTime)}
            </p>
          </div>
          <StatusBadge status={reservation.status} />
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--on-surface-variant)]">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
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
          <span className="font-bold text-[var(--primary)] text-sm">
            {formatCurrency(reservation.totalAmount)}
          </span>
        </div>
        {reservation.notes && (
          <p className="mt-2 text-xs text-[var(--on-surface-variant)] line-clamp-1">{reservation.notes}</p>
        )}
      </CardBody>
    </Card>
  );
}
