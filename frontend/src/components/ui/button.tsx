'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { LoadingSpinner } from './loading-spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white shadow-md shadow-[var(--primary)]/20 hover:shadow-lg hover:shadow-[var(--primary)]/30 active:scale-95',
  secondary:
    'bg-[var(--surface-tint)]/10 text-[var(--primary)] font-bold hover:bg-[var(--surface-tint)]/20 active:scale-95',
  danger:
    'bg-gradient-to-r from-[var(--error)] to-rose-600 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95',
  ghost:
    'bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] active:scale-95',
  outline:
    'bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5 active:scale-95',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-xs rounded-lg gap-1.5 font-bold',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2 font-bold',
  lg: 'px-8 py-3.5 text-base rounded-xl gap-2 font-bold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
