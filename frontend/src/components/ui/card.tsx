'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-[var(--surface-container-lowest)] rounded-xl border-none shadow-[var(--shadow-xs)] overflow-hidden',
          hover && 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('px-6 py-5', className)} {...props} />;
  },
);
CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('px-6 pb-5', className)} {...props} />;
  },
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4 flex items-center border-t border-[var(--outline-variant)]', className)}
        {...props}
      />
    );
  },
);
CardFooter.displayName = 'CardFooter';
