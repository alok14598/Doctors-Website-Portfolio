import Link from 'next/link';
import type { ClinicProfile, OpeningHour } from '@prisma/client';
import { dayName, formatOpeningHour } from '@/lib/format';
import { CurrentYear } from '@/components/ui/CurrentYear';
import { Container } from './Container';

const SITE_LINKS = [
  { href: '/about', label: 'About the clinic' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Our doctors' },
  { href: '/facilities', label: 'Facilities' },
  { href: '/patient-info', label: 'Patient information' },
  { href: '/contact', label: 'Contact & directions' },
] as const;

export function Footer({
  clinic,
  openingHours,
}: {
  clinic: ClinicProfile;
  openingHours: OpeningHour[];
}) {
  return (
    <footer className="bg-ink-900 mt-auto text-white/70">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-[17px] font-extrabold tracking-[-0.02em] text-white">{clinic.name}</p>
          <p className="mt-3 text-sm leading-relaxed">{clinic.tagline}</p>
          {clinic.accreditations.length > 0 ? (
            <ul className="text-ink-400 mt-4 space-y-1 text-xs">
              {clinic.accreditations.map((accreditation) => (
                <li key={accreditation}>{accreditation}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
            Visit
          </h2>
          <address className="mt-4 text-sm leading-relaxed not-italic">
            {clinic.addressLine1}
            <br />
            {clinic.addressLine2 ? (
              <>
                {clinic.addressLine2}
                <br />
              </>
            ) : null}
            {clinic.city}, {clinic.state} {clinic.postalCode}
          </address>
          <p className="mt-4 text-sm">
            <a
              href={`tel:${clinic.phone.replace(/\s/g, '')}`}
              className="transition-colors hover:text-white"
            >
              {clinic.phone}
            </a>
            <br />
            <a href={`mailto:${clinic.email}`} className="transition-colors hover:text-white">
              {clinic.email}
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
            Opening hours
          </h2>
          <dl className="mt-4 space-y-1.5 text-sm">
            {openingHours.map((hour) => (
              <div key={hour.dayOfWeek} className="flex justify-between gap-4">
                <dt>{dayName(hour.dayOfWeek)}</dt>
                <dd className="text-ink-900 text-right">{formatOpeningHour(hour)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
            Site
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {clinic.emergencyNote ? (
        <div className="border-t border-white/10 bg-white/5">
          <Container className="py-4">
            <p className="text-warning-600 text-sm">
              <strong className="font-semibold">Not an emergency service.</strong>{' '}
              {clinic.emergencyNote}
            </p>
          </Container>
        </div>
      ) : null}

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {clinic.name}
            {clinic.foundedYear ? ` · Caring for families since ${clinic.foundedYear}` : null}
          </p>
          <p>
            Demonstration site with placeholder content.{' '}
            <Link href="/admin/login" className="hover:text-ink-600 underline">
              Staff sign in
            </Link>
          </p>
        </Container>
      </div>
    </footer>
  );
}
