'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          'w-full rounded-[1.75rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] shadow-[0_24px_60px_rgba(11,28,48,0.14)] animate-in zoom-in-95',
          sizeStyles[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--outline-variant)] px-6 py-5">
            <h2 className="text-[1.9rem] font-bold tracking-[-0.03em] text-[var(--on-surface)]">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[var(--on-surface)] transition-colors hover:bg-[var(--surface-container-low)] cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className="p-6 text-[var(--on-surface)]">{children}</div>
      </div>
    </div>
  );
}
