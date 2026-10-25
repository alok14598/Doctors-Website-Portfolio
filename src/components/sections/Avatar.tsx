import Image from 'next/image';
import { cn } from '@/lib/cn';
import { isLocalImagePath } from '@/lib/schemas/common';

const initialsOf = (name: string): string =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

/**
 * Falls back to initials when there is no photograph. Deliberately not a stock
 * portrait — an invented face next to a real doctor's name misleads patients.
 */
export function Avatar({
  name,
  photoUrl,
  size = 'md',
}: {
  name: string;
  photoUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dimensions = { sm: 'size-11 text-sm', md: 'size-16 text-lg', lg: 'size-24 text-2xl' }[size];
  const pixels = { sm: 44, md: 64, lg: 96 }[size];

  // Seed data and direct SQL bypass the form, so an unusable path must
  // degrade to initials rather than throw inside next/image.
  if (photoUrl && isLocalImagePath(photoUrl)) {
    return (
      <Image
        src={photoUrl}
        alt={`Portrait of ${name}`}
        width={pixels}
        height={pixels}
        className={cn(dimensions, 'rounded-full object-cover')}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        dimensions,
        'bg-accent-50 text-accent-600 flex shrink-0 items-center justify-center rounded-full font-bold tracking-[-0.02em]',
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
