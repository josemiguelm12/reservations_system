'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

/* ─── Input ─── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-[var(--surface-container-highest)] border-none text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-all',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
            error && 'ring-2 ring-[var(--error)]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--error)] font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[var(--on-surface-variant)]">{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

/* ─── Textarea ─── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={textareaId} className="text-[11px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-[var(--surface-container-highest)] border-none text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-all resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
            error && 'ring-2 ring-[var(--error)]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--error)] font-medium">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

/* ─── Select ─── */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={selectId} className="text-[11px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-[var(--surface-container-highest)] border-none text-[var(--on-surface)] transition-all appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
            error && 'ring-2 ring-[var(--error)]',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--error)] font-medium">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
