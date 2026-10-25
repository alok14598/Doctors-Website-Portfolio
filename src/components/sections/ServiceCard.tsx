import Link from 'next/link';
import type { Service } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { IconChip } from '@/components/ui/Pill';
import { ArrowRightIcon, serviceIcon } from '@/components/ui/Icon';
import { formatDuration } from '@/lib/format';

export function ServiceCard({ service }: { service: Service }) {
  const duration = formatDuration(service.durationMinutes);

  return (
    <Card interactive className="flex h-full flex-col p-7">
      <IconChip icon={serviceIcon(service.slug, service.category)} />

      <h3 className="mt-5 text-lg">
        <Link
          href={`/services/${service.slug}`}
          className="hover:text-accent-600 transition-colors"
        >
          {service.name}
        </Link>
      </h3>

      <p className="text-ink-600 mt-3 flex-1 text-[15px] leading-[1.7]">{service.summary}</p>

      <div className="border-border mt-6 flex items-center justify-between gap-3 border-t pt-5">
        <span className="text-ink-400 text-sm">
          {duration ? `About ${duration}` : 'Duration varies'}
        </span>
        <Link
          href={`/services/${service.slug}`}
          className="group text-accent-600 inline-flex items-center gap-2 text-sm font-semibold"
        >
          View details<span className="sr-only"> about {service.name}</span>
          <ArrowRightIcon className="ease-smooth size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </Card>
  );
}
