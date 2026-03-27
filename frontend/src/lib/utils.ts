import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
};

export const formatRelative = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getResourceTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    COURT: 'Court',
    ROOM: 'Room',
    TABLE: 'Table',
    DESK: 'Desk',
    EQUIPMENT: 'Equipment',
    OTHER: 'Other',
  };
  return labels[type] || type;
};

export const getResourceTypeEmoji = (type: string) => {
  const emojis: Record<string, string> = {
    COURT: '🏟️',
    ROOM: '🏢',
    TABLE: '🪑',
    DESK: '💻',
    EQUIPMENT: '🔧',
    OTHER: '📦',
  };
  return emojis[type] || '📦';
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};
