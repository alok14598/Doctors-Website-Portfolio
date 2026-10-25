'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const inputClass = (hasError: boolean) =>
  cn(
    'w-full rounded-field border bg-surface px-3.5 py-3 text-[15px] text-ink-900',
    'placeholder:text-ink-400 transition-all duration-200 ease-smooth',
    'focus:outline-none focus-visible:outline-none',
    hasError
      ? 'border-danger-600 focus:shadow-[0_0_0_4px] focus:shadow-danger-50'
      : 'border-border-strong focus:border-accent-600 focus:shadow-field',
  );

type FieldProps = {
  label: string;
  /** Rendered with the generated id and aria wiring applied. */
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | undefined;
  }) => ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
};

/**
 * Every input on the site goes through this: a visible label wired by id, the
 * hint and error announced via aria-describedby, and `aria-invalid` set so a
 * screen reader hears the failure rather than only seeing a red border.
 */
export function Field({ label, children, error, hint, required = false }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-ink-900 block text-sm font-medium">
        {label}
        {required ? (
          <span className="text-danger-600 ml-1" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="text-ink-400 ml-1.5 text-xs font-normal">(optional)</span>
        )}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}

      {hint && !error ? (
        <p id={hintId} className="text-ink-400 text-xs">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-danger-600 text-xs font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}
