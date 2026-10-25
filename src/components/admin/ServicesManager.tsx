'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorNotice } from '@/components/ui/States';
import { formatDuration } from '@/lib/format';
import { SERVICE_CATEGORY_LABELS, type SERVICE_CATEGORIES } from '@/lib/schemas';
import { toggleServiceActive } from '@/server/actions/content.actions';
import { ServiceEditor, type ServiceEditorValues } from './ServiceEditor';

export type ServiceListItem = {
  id: string;
  name: string;
  slug: string;
  category: (typeof SERVICE_CATEGORIES)[number];
  durationMinutes: number | null;
  isActive: boolean;
  editorValues: ServiceEditorValues;
};

export function ServicesManager({ services }: { services: ServiceListItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ServiceEditorValues | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (service: ServiceListItem) => {
    setError(null);

    startTransition(async () => {
      const result = await toggleServiceActive(service.id, !service.isActive);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Services</h1>
          <p className="mt-2 text-sm">
            Withdrawing a service hides it from the website and from the appointment form, but keeps
            it on past requests.
          </p>
        </div>
        <Button type="button" onClick={() => setEditing('new')}>
          Add a service
        </Button>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      ) : null}

      {editing ? (
        <div className="mt-6">
          <ServiceEditor
            initial={editing === 'new' ? undefined : editing}
            onClose={() => setEditing(null)}
          />
        </div>
      ) : null}

      <ul className="mt-8 space-y-3">
        {services.map((service) => (
          <li key={service.id}>
            <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-ink-900 font-sans text-base font-semibold">
                  {service.name}
                  {!service.isActive ? (
                    <Badge tone="neutral" className="ml-2">
                      Withdrawn
                    </Badge>
                  ) : null}
                </p>
                <p className="text-ink-400 mt-1 text-xs">
                  {SERVICE_CATEGORY_LABELS[service.category]} · /services/{service.slug} ·{' '}
                  {formatDuration(service.durationMinutes) ?? 'Duration varies'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(service.editorValues)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant={service.isActive ? 'danger' : 'secondary'}
                  size="sm"
                  disabled={isPending}
                  onClick={() => toggle(service)}
                >
                  {service.isActive ? 'Withdraw' : 'Offer'}
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
