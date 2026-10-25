import { JsonLd } from '@/components/JsonLd';
import { Container } from '@/components/layout/Container';
import { Section, SectionHeading } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconChip } from '@/components/ui/Pill';
import { CheckIcon, ClockIcon, FACILITY_CATEGORY_ICONS } from '@/components/ui/Icon';
import { CTABand } from '@/components/sections/CTABand';
import { DoctorCard } from '@/components/sections/DoctorCard';
import { Hero } from '@/components/sections/Hero';
import { HoursTable } from '@/components/sections/HoursTable';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { SpecialtyTiles } from '@/components/sections/SpecialtyTiles';
import { TestimonialCard } from '@/components/sections/TestimonialCard';
import { medicalClinicJsonLd, pageMetadata } from '@/lib/seo';
import {
  getClinicProfile,
  getFacilities,
  getOpeningHours,
  getSpecialties,
  getTestimonials,
} from '@/server/services/clinic.service';
import { FEATURED_DOCTOR_COUNT, listDoctors } from '@/server/services/doctor.service';
import { listServices } from '@/server/services/service.service';

export const metadata = pageMetadata({
  title: 'Meridian Family Clinic — Everyday care, delivered carefully',
  description:
    'A family clinic in Koramangala, Bengaluru. Six consultants, on-site diagnostics and an ' +
    'in-house pharmacy. Request an appointment online.',
  path: '/',
});

const FEATURED_SERVICE_COUNT = 6;

export default async function HomePage() {
  const [clinic, openingHours, services, doctors, facilities, testimonials, specialties] =
    await Promise.all([
      getClinicProfile(),
      getOpeningHours(),
      listServices(),
      listDoctors(),
      getFacilities(),
      getTestimonials(3),
      getSpecialties(),
    ]);

  const yearsOfCare = clinic.foundedYear ? new Date().getFullYear() - clinic.foundedYear : null;

  const heroStats = [
    {
      value: `${doctors.length}`,
      label: 'Consultants on site',
      caption: 'Across six specialties, one location.',
    },
    {
      value: yearsOfCare ? `${yearsOfCare}+` : `${services.length}`,
      label: yearsOfCare ? 'Years of care' : 'Services offered',
      caption: clinic.foundedYear
        ? `Looking after families since ${clinic.foundedYear}.`
        : 'From first visit to follow-up.',
    },
  ];

  return (
    <>
      <JsonLd data={medicalClinicJsonLd(clinic, openingHours)} />

      <Hero clinic={clinic} stats={heroStats} />
      <SpecialtyTiles specialties={specialties} />

      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="What we treat"
            title="Care for the whole family,"
            titleAccent="under one roof"
            description="Most concerns are handled here from first visit to follow-up, with diagnostics in the next room rather than across town."
          />
          <TextLink href="/services">All services</TextLink>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, FEATURED_SERVICE_COUNT).map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Our doctors"
            title="You will see the same"
            titleAccent="doctor next time"
            description="A single location and a small team, so your history is known rather than re-read at every visit."
          />
          <TextLink href="/doctors">All doctors</TextLink>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.slice(0, FEATURED_DOCTOR_COUNT).map((doctor) => (
            <li key={doctor.id}>
              <DoctorCard doctor={doctor} />
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="In the clinic"
              title="Diagnostics, treatment and"
              titleAccent="pharmacy on site"
              description="Most visits end with an answer rather than a referral, because the tests that answer the question happen here."
            />

            <ul className="mt-8 space-y-4">
              {facilities.slice(0, 5).map((facility) => (
                <li key={facility.id} className="flex gap-3.5">
                  <IconChip
                    icon={FACILITY_CATEGORY_ICONS[facility.category]}
                    size="sm"
                    tone="soft"
                  />
                  <span className="text-[15px] leading-[1.6]">
                    <span className="text-ink-900 font-semibold">{facility.name}</span>
                    {' — '}
                    {facility.description}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <TextLink href="/facilities">See everything in the clinic</TextLink>
            </div>
          </div>

          <Card className="p-7 sm:p-8">
            <div className="flex items-center gap-3.5">
              <IconChip icon={ClockIcon} />
              <h3 className="text-xl">Clinic hours</h3>
            </div>
            <div className="mt-6">
              <HoursTable openingHours={openingHours} />
            </div>
            <p className="bg-accent-50 text-ink-600 rounded-field mt-6 flex gap-3 p-4 text-sm leading-relaxed">
              <CheckIcon aria-hidden="true" className="text-accent-600 mt-0.5 size-4 shrink-0" />
              Walk-ins are welcome for family medicine. Specialist clinics run on fixed days, so
              please request an appointment for those.
            </p>
          </Card>
        </div>
      </Section>

      {testimonials.length > 0 ? (
        <Section tone="muted">
          <SectionHeading
            eyebrow="Patient experience"
            title="What our"
            titleAccent="patients say"
            align="center"
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CTABand phone={clinic.phone} />

      <Container className="pb-12">
        <p className="text-ink-400 text-center text-[13px]">
          This is a demonstration site. The clinic, doctors and registration numbers shown are
          placeholder content.
        </p>
      </Container>
    </>
  );
}
