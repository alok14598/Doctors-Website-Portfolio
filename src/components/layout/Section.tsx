import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Pill } from '@/components/ui/Pill';
import { Container } from './Container';

type SectionProps = {
  children: ReactNode;
  /** Alternating tint, used to separate sections without drawing a line. */
  tone?: 'surface' | 'muted';
  className?: string;
  width?: 'default' | 'narrow';
  id?: string;
};

export function Section({
  children,
  tone = 'surface',
  className,
  width = 'default',
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('reveal py-16 sm:py-24', tone === 'muted' && 'bg-surface-2', className)}
    >
      <Container width={width}>{children}</Container>
    </section>
  );
}

/**
 * A pill badge, then a two-tone heading: the first half in navy, the optional
 * second half in the accent. Splitting the heading rather than marking it up
 * inline keeps the colour out of the content and out of the database.
 */
export function SectionHeading({
  eyebrow,
  title,
  titleAccent,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  const isCentred = align === 'center';

  return (
    <div className={cn('max-w-2xl', isCentred && 'mx-auto text-center')}>
      {eyebrow ? (
        <div className={cn('mb-5 flex', isCentred && 'justify-center')}>
          <Pill>{eyebrow}</Pill>
        </div>
      ) : null}

      <h2 className="text-[1.875rem] sm:text-[2.5rem]">
        {title}
        {titleAccent ? (
          <>
            {' '}
            <span className="heading-accent">{titleAccent}</span>
          </>
        ) : null}
      </h2>

      {description ? (
        <p className={cn('text-ink-600 mt-5 text-[17px] leading-[1.7]', isCentred && 'mx-auto')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
