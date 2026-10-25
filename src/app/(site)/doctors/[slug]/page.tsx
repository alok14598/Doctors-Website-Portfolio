import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAppError } from '@/lib/errors';
import { formatConsultingDays, formatExperience } from '@/lib/format';
import { pageMetadata, physicianJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Avatar } from '@/components/sections/Avatar';
import { getDoctorBySlug, listDoctorSlugs } from '@/server/services/doctor.service';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listDoctorSlugs();
  return slugs.map((slug) => ({ slug }));
}

const loadDoctor = async (slug: string) => {
  try {
    return await getDoctorBySlug(slug);
  } catch (error) {
    if (isAppError(error) && error.code === 'NOT_FOUND') notFound();
    throw error;
  }
};

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const doctor = await loadDoctor(slug);

  return pageMetadata({
    title: `${doctor.name} — ${doctor.specialty.name}`,
    description: `${doctor.designation} at Meridian Family Clinic. ${formatExperience(doctor.experienceYears)}.`,
    path: `/doctors/${doctor.slug}`,
  });
}

export default async function DoctorDetailPage({ params }: Params) {
  const { slug } = await params;
  const doctor = await loadDoctor(slug);

  return (
    <>
      <JsonLd data={physicianJsonLd(doctor)} />

      <div className="border-border bg-surface-2 border-b py-14 sm:py-16">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={doctor.name} photoUrl={doctor.photoUrl} size="lg" />
            <div>
              <Badge tone="accent">{doctor.specialty.name}</Badge>
              <h1 className="mt-3 text-4xl sm:text-5xl">{doctor.name}</h1>
              <p className="text-ink-600 mt-3 text-base sm:text-lg">{doctor.designation}</p>
              {doctor.qualifications.length > 0 ? (
                <p className="text-ink-400 mt-2 text-sm">{doctor.qualifications.join(' · ')}</p>
              ) : null}
            </div>
          </div>
        </Container>
      </div>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="prose-clinic max-w-2xl">
            <h2 className="text-2xl">About {doctor.name.replace(/^Dr\.?\s+/i, 'Dr. ')}</h2>
            <p>{doctor.bio}</p>

            {doctor.services.length > 0 ? (
              <>
                <h2 className="mt-10 text-2xl">Services provided</h2>
                <ul className="not-prose mt-4 space-y-2">
                  {doctor.services.map(({ service }) => (
                    <li key={service.id} className="flex gap-3 text-sm">
                      <span
                        aria-hidden="true"
                        className="bg-accent-600 mt-1.5 size-1.5 shrink-0 rounded-full"
                      />
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-accent-700 font-medium hover:underline"
                      >
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                Consulting
              </h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Days</dt>
                  <dd className="text-ink-900 text-right">
                    {formatConsultingDays(doctor.consultingDays)}
                  </dd>
                </div>
                {doctor.consultingHours ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-400">Hours</dt>
                    <dd className="text-ink-900 text-right">{doctor.consultingHours}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Experience</dt>
                  <dd className="text-ink-900 text-right">
                    {formatExperience(doctor.experienceYears)}
                  </dd>
                </div>
                {doctor.languages.length > 0 ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-400">Speaks</dt>
                    <dd className="text-ink-900 text-right">{doctor.languages.join(', ')}</dd>
                  </div>
                ) : null}
                {doctor.registrationNo ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-400">Registration</dt>
                    <dd className="text-ink-900 text-right">{doctor.registrationNo}</dd>
                  </div>
                ) : null}
              </dl>

              <ButtonLink href={`/appointment?doctor=${doctor.id}`} className="mt-6 w-full">
                Request an appointment
              </ButtonLink>
            </Card>
          </div>
        </div>

        <p className="mt-12">
          <Link href="/doctors" className="text-accent-700 text-sm font-medium hover:underline">
            ← All doctors
          </Link>
        </p>
      </Section>
    </>
  );
}
