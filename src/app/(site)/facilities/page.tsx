import { Section } from '@/components/layout/Section';
import { CTABand } from '@/components/sections/CTABand';
import { FACILITY_CATEGORY_LABELS, FacilityList } from '@/components/sections/FacilityList';
import { PageHeader } from '@/components/sections/PageHeader';
import { EmptyState } from '@/components/ui/States';
import { pageMetadata } from '@/lib/seo';
import { getClinicProfile, getFacilitiesByCategory } from '@/server/services/clinic.service';
import type { Facility } from '@prisma/client';

export const metadata = pageMetadata({
  title: 'Facilities',
  description:
    'Digital X-ray, ECG, ultrasound, on-site sample collection, a minor procedure room, an ' +
    'in-house pharmacy, step-free access and basement parking.',
  path: '/facilities',
});

export default async function FacilitiesPage() {
  const [groups, clinic] = await Promise.all([getFacilitiesByCategory(), getClinicProfile()]);

  return (
    <>
      <PageHeader
        eyebrow="Facilities"
        title="What is available"
        titleAccent="in the clinic"
        description="Everything listed here is on this floor. If a test can be done on site, it is, because splitting a visit across two buildings is how answers get delayed."
      />

      {groups.length === 0 ? (
        <Section>
          <EmptyState
            title="No facilities are listed yet"
            description="Run the seed script to load the clinic's facilities."
          />
        </Section>
      ) : (
        groups.map((group, index) => (
          <Section key={group.category} tone={index % 2 === 1 ? 'muted' : 'surface'}>
            <h2 className="text-2xl sm:text-3xl">
              {FACILITY_CATEGORY_LABELS[group.category as Facility['category']]}
            </h2>
            <div className="mt-8">
              <FacilityList facilities={group.items} />
            </div>
          </Section>
        ))
      )}

      <CTABand
        title="Not sure whether we can help?"
        description="Reception can tell you in a minute whether something is done here or needs a hospital. Call or send a request."
        phone={clinic.phone}
      />
    </>
  );
}
