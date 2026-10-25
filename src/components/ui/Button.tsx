import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ArrowRightIcon } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/**
 * Pill-shaped, as the premium-minimal idiom expects. The active-state scale is
 * the only motion: it makes a tap feel physical without animating on load.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap ' +
  'transition-all duration-200 ease-smooth active:scale-[0.97] ' +
  'disabled:pointer-events-none disabled:opacity-40';

const variants: Record<Variant, string> = {
  primary: 'bg-accent-600 text-white shadow-card hover:bg-accent-700',
  // The hairline matters: on a muted section the fill matches the background
  // exactly, and without a border the button vanishes.
  secondary: 'border border-border-strong bg-surface text-ink-900 hover:bg-surface-2',
  ghost: 'text-accent-600 hover:bg-accent-50',
  danger: 'bg-danger-50 text-danger-600 hover:bg-danger-50/70',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const buttonClass = (variant: Variant, size: Size, className?: string) =>
  cn(base, variants[variant], sizes[size], className);

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
};

/** Separate from Button so a navigation never renders as a <button>. */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
}: ButtonLinkProps) {
  return (
    <Link href={href} onClick={onClick} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/**
 * The understated tertiary action — a blue text link with a chevron that
 * slides on hover. Used where a third button would crowd the row.
 */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group text-accent-600 inline-flex items-center gap-2 text-sm font-semibold',
        className,
      )}
    >
      {children}
      <ArrowRightIcon className="ease-smooth size-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
