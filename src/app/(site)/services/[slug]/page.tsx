import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAppError } from '@/lib/errors';
import { SERVICE_CATEGORY_LABELS } from '@/lib/schemas';
import { pageMetadata } from '@/lib/seo';
import { formatDuration } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Avatar } from '@/components/sections/Avatar';
import { PageHeader } from '@/components/sections/PageHeader';
import { getServiceBySlug, listServiceSlugs } from '@/server/services/service.service';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** A missing or withdrawn service is a 404, not a server error. */
const loadService = async (slug: string) => {
  try {
    return await getServiceBySlug(slug);
  } catch (error) {
    if (isAppError(error) && error.code === 'NOT_FOUND') notFound();
    throw error;
  }
};

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const service = await loadService(slug);

  return pageMetadata({
    title: service.name,
    description: service.summary,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const service = await loadService(slug);
  const duration = formatDuration(service.durationMinutes);

  return (
    <>
      <PageHeader
        eyebrow={SERVICE_CATEGORY_LABELS[service.category]}
        title={service.name}
        description={service.summary}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="prose-clinic max-w-2xl">
            <h2 className="text-2xl">What this involves</h2>
            <p>{service.description}</p>

            {service.preparation ? (
              <>
                <h2 className="mt-10 text-2xl">Before you come</h2>
                <p>{service.preparation}</p>
              </>
            ) : null}
          </div>

          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                Appointment details
              </h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Typical length</dt>
                  <dd className="text-ink-900 text-right">{duration ?? 'Varies'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Category</dt>
                  <dd className="text-ink-900 text-right">
                    {SERVICE_CATEGORY_LABELS[service.category]}
                  </dd>
                </div>
              </dl>
              <ButtonLink href="/appointment" className="mt-6 w-full">
                Request this appointment
              </ButtonLink>
            </Card>

            {service.doctors.length > 0 ? (
              <Card className="p-6">
                <h2 className="text-ink-900 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                  Who you will see
                </h2>
                <ul className="mt-5 space-y-4">
                  {service.doctors.map(({ doctor }) => (
                    <li key={doctor.id} className="flex items-center gap-3">
                      <Avatar name={doctor.name} photoUrl={doctor.photoUrl} size="sm" />
                      <span className="min-w-0">
                        <Link
                          href={`/doctors/${doctor.slug}`}
                          className="text-ink-900 hover:text-accent-700 block text-sm font-medium"
                        >
                          {doctor.name}
                        </Link>
                        <Badge tone="accent" className="mt-1">
                          {doctor.specialty.name}
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
        </div>

        <p className="mt-12">
          <Link href="/services" className="text-accent-700 text-sm font-medium hover:underline">
            ← All services
          </Link>
        </p>
      </Section>
    </>
  );
}
