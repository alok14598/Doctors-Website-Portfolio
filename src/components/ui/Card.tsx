import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Adds a hover lift. Only for cards that are themselves a link. */
  interactive?: boolean;
};

/**
 * Depth comes from a soft, wide shadow rather than a drawn border — the border
 * here is a hairline that keeps the card's edge legible on white, nothing more.
 */
export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border-border bg-surface shadow-card border',
        interactive &&
          'ease-smooth hover:shadow-lift transition-all duration-300 hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
