'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ─── StatusBadge for reservations ─── */
const statusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pendiente' },
  CONFIRMED: { variant: 'info', label: 'Confirmada' },
  CANCELLED: { variant: 'danger', label: 'Cancelada' },
  COMPLETED: { variant: 'success', label: 'Completada' },
  NO_SHOW: { variant: 'neutral', label: 'No presentado' },
};

const paymentStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pendiente' },
  PROCESSING: { variant: 'info', label: 'Procesando' },
  COMPLETED: { variant: 'success', label: 'Completado' },
  FAILED: { variant: 'danger', label: 'Fallido' },
  REFUNDED: { variant: 'neutral', label: 'Reembolsado' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || { variant: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = paymentStatusMap[status] || { variant: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
