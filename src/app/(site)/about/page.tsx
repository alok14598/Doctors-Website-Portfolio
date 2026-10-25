import { Card } from '@/components/ui/Card';
import { Section, SectionHeading } from '@/components/layout/Section';
import { CTABand } from '@/components/sections/CTABand';
import { HoursTable } from '@/components/sections/HoursTable';
import { PageHeader } from '@/components/sections/PageHeader';
import { pageMetadata } from '@/lib/seo';
import { getClinicProfile, getOpeningHours } from '@/server/services/clinic.service';
import { listDoctors } from '@/server/services/doctor.service';

export const metadata = pageMetadata({
  title: 'About the clinic',
  description:
    'Meridian Family Clinic has looked after families in Koramangala since 2011 — one location, ' +
    'six consultants, and notes that stay in one place.',
  path: '/about',
});

export default async function AboutPage() {
  const [clinic, openingHours, doctors] = await Promise.all([
    getClinicProfile(),
    getOpeningHours(),
    listDoctors(),
  ]);

  const specialties = [...new Set(doctors.map((doctor) => doctor.specialty.name))];

  return (
    <>
      <PageHeader eyebrow="About" title={`About ${clinic.name}`} description={clinic.tagline} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="prose-clinic max-w-2xl">
            {clinic.about.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}

            {clinic.mission ? (
              <>
                <h2 className="mt-10 text-2xl">What we are trying to do</h2>
                <p>{clinic.mission}</p>
              </>
            ) : null}

            <h2 className="mt-10 text-2xl">What we are not</h2>
            <p>
              We are an outpatient clinic. There is no emergency department and there are no
              inpatient beds. Saying so plainly matters more than appearing comprehensive — for
              chest pain, severe bleeding, breathing difficulty or a suspected stroke, call 108 or
              go to the nearest hospital emergency room.
            </p>
          </div>

          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                At a glance
              </h2>
              <dl className="mt-5 space-y-3 text-sm">
                {clinic.foundedYear ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-400">Established</dt>
                    <dd className="text-ink-900">{clinic.foundedYear}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Consultants</dt>
                  <dd className="text-ink-900">{doctors.length}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Locations</dt>
                  <dd className="text-ink-900">One, deliberately</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                Specialties on site
              </h2>
              <ul className="mt-5 space-y-2 text-sm">
                {specialties.map((specialty) => (
                  <li key={specialty} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="bg-accent-600 mt-1.5 size-1.5 shrink-0 rounded-full"
                    />
                    {specialty}
                  </li>
                ))}
              </ul>
            </Card>

            {clinic.accreditations.length > 0 ? (
              <Card className="p-6">
                <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                  Accreditations
                </h2>
                <ul className="mt-5 space-y-2 text-sm">
                  {clinic.accreditations.map((accreditation) => (
                    <li key={accreditation}>{accreditation}</li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
        </div>
      </Section>

      <Section tone="muted" width="narrow">
        <SectionHeading eyebrow="When to come" title="Opening hours" />
        <Card className="mt-8 p-6 sm:p-8">
          <HoursTable openingHours={openingHours} />
        </Card>
      </Section>

      <CTABand phone={clinic.phone} />
    </>
  );
}
