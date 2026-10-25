import Link from 'next/link';
import { Section } from '@/components/layout/Section';
import { CTABand } from '@/components/sections/CTABand';
import { DoctorCard } from '@/components/sections/DoctorCard';
import { PageHeader } from '@/components/sections/PageHeader';
import { EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/cn';
import { pageMetadata } from '@/lib/seo';
import { getClinicProfile } from '@/server/services/clinic.service';
import { listDoctors, listFilterableSpecialties } from '@/server/services/doctor.service';

export const metadata = pageMetadata({
  title: 'Our doctors',
  description:
    'Meet the consultants at Meridian Family Clinic — family medicine, paediatrics, ' +
    'dermatology, orthopaedics, gynaecology and dentistry.',
  path: '/doctors',
});

type Props = { searchParams: Promise<{ specialty?: string }> };

export default async function DoctorsPage({ searchParams }: Props) {
  const { specialty } = await searchParams;

  const [specialties, clinic] = await Promise.all([
    listFilterableSpecialties(),
    getClinicProfile(),
  ]);

  // An unknown filter value falls back to everyone rather than an empty page.
  const activeSlug = specialties.some((item) => item.slug === specialty) ? specialty : undefined;
  const doctors = await listDoctors({ specialtySlug: activeSlug });

  return (
    <>
      <PageHeader
        eyebrow="Our doctors"
        title="The people who"
        titleAccent="will see you"
        description="Six consultants, each with fixed consulting days. If you are being treated for something ongoing, ask for the doctor who saw you last — we would rather you did."
      />

      <Section>
        <nav aria-label="Filter by specialty" className="flex flex-wrap gap-2">
          <Link
            href="/doctors"
            aria-current={activeSlug ? undefined : 'page'}
            className={cn(
              'rounded-pill ease-smooth px-4 py-2 text-sm transition-all duration-200',
              activeSlug
                ? 'bg-surface-2 text-ink-600 hover:bg-surface-3 hover:text-ink-900'
                : 'bg-ink-900 text-white',
            )}
          >
            All specialties
          </Link>
          {specialties.map((item) => {
            const isActive = activeSlug === item.slug;
            return (
              <Link
                key={item.slug}
                href={`/doctors?specialty=${item.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'rounded-pill ease-smooth px-4 py-2 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-ink-900 text-white'
                    : 'bg-surface-2 text-ink-600 hover:bg-surface-3 hover:text-ink-900',
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {doctors.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No doctors listed yet"
              description="Run the seed script to load the clinic's consultants."
            />
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                <DoctorCard doctor={doctor} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <CTABand phone={clinic.phone} />
    </>
  );
}
