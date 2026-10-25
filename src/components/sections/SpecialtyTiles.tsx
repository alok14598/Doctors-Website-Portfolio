import Link from 'next/link';
import type { Specialty } from '@prisma/client';
import { Container } from '@/components/layout/Container';
import { IconChip } from '@/components/ui/Pill';
import {
  FlaskIcon,
  HeartPulseIcon,
  ShieldIcon,
  StethoscopeIcon,
  ToothIcon,
  UsersIcon,
} from '@/components/ui/Icon';

/**
 * The quick-access row under the hero: one tile per specialty, linking into
 * the filtered doctor directory.
 *
 * Specialties are clinic data, so the glyph is chosen by slug with a sensible
 * default — adding a specialty in the admin never leaves a blank tile.
 */
const ICON_BY_SLUG: Record<string, typeof StethoscopeIcon> = {
  'family-medicine': StethoscopeIcon,
  paediatrics: UsersIcon,
  dermatology: ShieldIcon,
  orthopaedics: HeartPulseIcon,
  'obstetrics-gynaecology': FlaskIcon,
  dentistry: ToothIcon,
};

export function SpecialtyTiles({ specialties }: { specialties: Specialty[] }) {
  if (specialties.length === 0) return null;

  return (
    <section className="reveal bg-surface pb-4">
      <Container>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {specialties.map((specialty) => {
            const Icon = ICON_BY_SLUG[specialty.slug] ?? StethoscopeIcon;

            return (
              <li key={specialty.id}>
                <Link
                  href={`/doctors?specialty=${specialty.slug}`}
                  className="rounded-card bg-surface-2 hover:bg-accent-50 ease-smooth flex h-full flex-col items-center gap-3 px-4 py-6 text-center transition-colors duration-200"
                >
                  <IconChip icon={Icon} tone="soft" />
                  <span className="text-ink-900 text-sm leading-snug font-semibold">
                    {specialty.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
