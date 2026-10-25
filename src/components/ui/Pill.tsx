import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/cn';
import { HeartPulseIcon } from './Icon';

/**
 * The small badge that sits above a section heading. It is decorative framing,
 * not a control — so it is a <span>, never a button or link.
 */
export function Pill({
  children,
  icon: Icon = HeartPulseIcon,
  className,
  tone = 'light',
}: {
  children: ReactNode;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  tone?: 'light' | 'white';
}) {
  return (
    <span
      className={cn(
        'rounded-pill inline-flex items-center gap-2 py-1.5 pr-4 pl-2 text-sm font-semibold',
        tone === 'light'
          ? 'bg-accent-50 text-accent-600'
          : 'bg-surface text-accent-600 shadow-card',
        className,
      )}
    >
      <span className="bg-accent-600 flex size-6 items-center justify-center rounded-full text-white">
        <Icon className="size-3.5" />
      </span>
      {children}
    </span>
  );
}

/**
 * The round blue glyph that fronts a service, facility or feature card.
 * Sized in three steps so a card, a tile and a list row stay on one rhythm.
 */
export function IconChip({
  icon: Icon,
  size = 'md',
  tone = 'solid',
  className,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'solid' | 'soft';
  className?: string;
}) {
  const box = { sm: 'size-9', md: 'size-11', lg: 'size-14' }[size];
  const glyph = { sm: 'size-4.5', md: 'size-5.5', lg: 'size-7' }[size];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        tone === 'solid' ? 'bg-accent-600 text-white' : 'bg-accent-50 text-accent-600',
        box,
        className,
      )}
    >
      <Icon className={glyph} />
    </span>
  );
}
