import { JsonLd } from '@/components/JsonLd';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import { HoursTable } from '@/components/sections/HoursTable';
import { PageHeader } from '@/components/sections/PageHeader';
import { medicalClinicJsonLd, pageMetadata } from '@/lib/seo';
import { getClinicProfile, getOpeningHours } from '@/server/services/clinic.service';

export const metadata = pageMetadata({
  title: 'Contact & directions',
  description:
    'Meridian Family Clinic, 18th Main Road, 5th Block, Koramangala, Bengaluru 560095. ' +
    'Phone, email, opening hours and directions.',
  path: '/contact',
});

export default async function ContactPage() {
  const [clinic, openingHours] = await Promise.all([getClinicProfile(), getOpeningHours()]);

  const mapsQuery = encodeURIComponent(
    [clinic.addressLine1, clinic.addressLine2, clinic.city, clinic.postalCode]
      .filter(Boolean)
      .join(', '),
  );

  return (
    <>
      <JsonLd data={medicalClinicJsonLd(clinic, openingHours)} />

      <PageHeader
        eyebrow="Contact"
        title="How to"
        titleAccent="reach us"
        description="One location in Koramangala, with lift access from street level and basement parking."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="p-6">
            <h2 className="text-xl">Visit</h2>
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
              <br />
              {clinic.country}
            </address>
            <ButtonLink
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              variant="secondary"
              size="sm"
              className="mt-5"
            >
              Open in Maps
            </ButtonLink>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl">Call or write</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-ink-400">Reception</dt>
                <dd>
                  <a
                    href={`tel:${clinic.phone.replace(/\s/g, '')}`}
                    className="text-ink-900 hover:text-accent-700 font-medium"
                  >
                    {clinic.phone}
                  </a>
                </dd>
              </div>
              {clinic.altPhone ? (
                <div>
                  <dt className="text-ink-400">Mobile</dt>
                  <dd>
                    <a
                      href={`tel:${clinic.altPhone.replace(/\s/g, '')}`}
                      className="text-ink-900 hover:text-accent-700 font-medium"
                    >
                      {clinic.altPhone}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-ink-400">Email</dt>
                <dd>
                  <a
                    href={`mailto:${clinic.email}`}
                    className="text-ink-900 hover:text-accent-700 font-medium break-all"
                  >
                    {clinic.email}
                  </a>
                </dd>
              </div>
            </dl>
            <ButtonLink href="/appointment" size="sm" className="mt-5">
              Request an appointment
            </ButtonLink>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl">Opening hours</h2>
            <div className="mt-4">
              <HoursTable openingHours={openingHours} />
            </div>
          </Card>
        </div>

        {clinic.mapEmbedUrl ? (
          <div className="rounded-card border-border mt-10 overflow-hidden border">
            <iframe
              src={clinic.mapEmbedUrl}
              title={`Map showing the location of ${clinic.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[16/9] w-full"
            />
          </div>
        ) : (
          <Card className="bg-surface-2 mt-10 p-8 text-center">
            <p className="text-ink-600 text-sm">
              A map embed has not been configured for this demonstration site. Use{' '}
              <strong className="text-ink-900 font-medium">Open in Maps</strong> above for
              directions.
            </p>
          </Card>
        )}
      </Section>
    </>
  );
}
