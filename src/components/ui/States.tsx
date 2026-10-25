import type { ReactNode } from 'react';
import { Card } from './Card';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card className="px-6 py-12 text-center">
      <p className="text-ink-900 text-lg font-semibold tracking-[-0.02em]">{title}</p>
      {description ? <p className="text-ink-600 mt-2 text-sm">{description}</p> : null}
    </Card>
  );
}

export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="border-danger-600/20 bg-danger-50 text-danger-600 rounded-field border px-4 py-3 text-sm"
    >
      {children}
    </div>
  );
}

export function SuccessNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="border-success-600/20 bg-success-50 text-success-600 rounded-field border px-4 py-3 text-sm"
    >
      {children}
    </div>
  );
}

/** Matches the line height of the content it replaces, so nothing jumps. */
export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="bg-surface-3 h-4 animate-pulse rounded"
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
