'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorNotice } from '@/components/ui/States';
import { formatConsultingDays } from '@/lib/format';
import { toggleDoctorActive } from '@/server/actions/content.actions';
import { DoctorEditor, type DoctorEditorValues } from './DoctorEditor';

type Option = { id: string; name: string };

export type DoctorListItem = {
  id: string;
  name: string;
  slug: string;
  designation: string;
  specialtyName: string;
  specialtyId: string;
  isActive: boolean;
  consultingDays: number[];
  editorValues: DoctorEditorValues;
};

export function DoctorsManager({
  doctors,
  specialties,
  services,
}: {
  doctors: DoctorListItem[];
  specialties: Option[];
  services: Option[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<DoctorEditorValues | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (doctor: DoctorListItem) => {
    setError(null);

    startTransition(async () => {
      const result = await toggleDoctorActive(doctor.id, !doctor.isActive);
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
          <h1 className="text-3xl">Doctors</h1>
          <p className="mt-2 text-sm">
            Changes appear on the public site immediately. Hiding a doctor keeps their record and
            any appointment history.
          </p>
        </div>
        <Button type="button" onClick={() => setEditing('new')}>
          Add a doctor
        </Button>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      ) : null}

      {editing ? (
        <div className="mt-6">
          <DoctorEditor
            specialties={specialties}
            services={services}
            initial={editing === 'new' ? undefined : editing}
            onClose={() => setEditing(null)}
          />
        </div>
      ) : null}

      <ul className="mt-8 space-y-3">
        {doctors.map((doctor) => (
          <li key={doctor.id}>
            <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-ink-900 font-sans text-base font-semibold">
                  {doctor.name}
                  {!doctor.isActive ? (
                    <Badge tone="neutral" className="ml-2">
                      Hidden
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-1 text-sm">{doctor.designation}</p>
                <p className="text-ink-400 mt-1 text-xs">
                  {doctor.specialtyName} · /doctors/{doctor.slug} ·{' '}
                  {formatConsultingDays(doctor.consultingDays)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(doctor.editorValues)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant={doctor.isActive ? 'danger' : 'secondary'}
                  size="sm"
                  disabled={isPending}
                  onClick={() => toggle(doctor)}
                >
                  {doctor.isActive ? 'Hide' : 'Show'}
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
