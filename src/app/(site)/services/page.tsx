import { Section } from '@/components/layout/Section';
import { CTABand } from '@/components/sections/CTABand';
import { PageHeader } from '@/components/sections/PageHeader';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { EmptyState } from '@/components/ui/States';
import { SERVICE_CATEGORY_LABELS } from '@/lib/schemas';
import { pageMetadata } from '@/lib/seo';
import { getClinicProfile } from '@/server/services/clinic.service';
import { listServicesByCategory } from '@/server/services/service.service';

export const metadata = pageMetadata({
  title: 'Services',
  description:
    'Consultations, diagnostics, minor procedures, preventive care and dental treatment at ' +
    'Meridian Family Clinic, Koramangala.',
  path: '/services',
});

export default async function ServicesPage() {
  const [groups, clinic] = await Promise.all([listServicesByCategory(), getClinicProfile()]);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="What we treat"
        titleAccent="and test for"
        description="Each service below says what the visit involves and roughly how long it takes, so you can plan the day around it."
      />

      {groups.length === 0 ? (
        <Section>
          <EmptyState
            title="No services are listed yet"
            description="Run the seed script to load the clinic's services."
          />
        </Section>
      ) : (
        groups.map((group, index) => (
          <Section key={group.category} tone={index % 2 === 1 ? 'muted' : 'surface'}>
            <h2 className="text-2xl sm:text-3xl">{SERVICE_CATEGORY_LABELS[group.category]}</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((service) => (
                <li key={service.id}>
                  <ServiceCard service={service} />
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}

      <CTABand phone={clinic.phone} />
    </>
  );
}
