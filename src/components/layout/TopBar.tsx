import type { ClinicProfile, OpeningHour } from '@prisma/client';
import { Container } from './Container';
import { ClockIcon, MailIcon, PinIcon } from '@/components/ui/Icon';
import { dayName, formatOpeningHour } from '@/lib/format';

/**
 * The thin navy strip above the header: where we are, when we are open, how to
 * write to us. Hidden below `lg` — on a phone this is three lines of chrome
 * before any content, and all of it repeats in the footer.
 */
export function TopBar({
  clinic,
  openingHours,
}: {
  clinic: ClinicProfile;
  openingHours: OpeningHour[];
}) {
  const open = openingHours.filter((hour) => !hour.isClosed);
  const first = open[0];
  const last = open[open.length - 1];

  const hoursLabel =
    first && last
      ? `${dayName(first.dayOfWeek).slice(0, 3)}–${dayName(last.dayOfWeek).slice(0, 3)}: ${formatOpeningHour(first)}`
      : null;

  return (
    <div className="bg-ink-900 hidden text-white lg:block">
      <Container className="flex h-10 items-center justify-between gap-6 text-[13px]">
        <div className="flex items-center gap-7">
          <span className="flex items-center gap-2">
            <PinIcon className="text-accent-500 size-4" />
            {clinic.addressLine1}, {clinic.city} {clinic.postalCode}
          </span>
          {hoursLabel ? (
            <span className="flex items-center gap-2">
              <ClockIcon className="text-accent-500 size-4" />
              {hoursLabel}
            </span>
          ) : null}
        </div>

        <a
          href={`mailto:${clinic.email}`}
          className="hover:text-accent-500 flex items-center gap-2 transition-colors"
        >
          <MailIcon className="text-accent-500 size-4" />
          {clinic.email}
        </a>
      </Container>
    </div>
  );
}
