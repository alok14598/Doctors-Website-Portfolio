'use client';

import { useState, useTransition } from 'react';
import type { AppointmentStatus } from '@prisma/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorNotice } from '@/components/ui/States';
import { APPOINTMENT_STATUSES, SLOT_LABELS } from '@/lib/schemas';
import { formatDate, formatDateTime, titleCase } from '@/lib/format';
import { updateAppointmentStatus } from '@/server/actions/appointment.actions';

const STATUS_TONES = {
  NEW: 'warning',
  CONTACTED: 'accent',
  CONFIRMED: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
} as const;

export type AppointmentRowData = {
  id: string;
  patientName: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  preferredSlot: keyof typeof SLOT_LABELS;
  reason: string;
  status: AppointmentStatus;
  staffNote: string | null;
  createdAt: string;
  doctorName: string | null;
  serviceName: string | null;
};

export function AppointmentRow({ appointment }: { appointment: AppointmentRowData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [note, setNote] = useState(appointment.staffNote ?? '');
  const [isSaved, setIsSaved] = useState(false);

  const isCancelled = appointment.status === 'CANCELLED';

  const save = () => {
    setError(null);
    setIsSaved(false);

    startTransition(async () => {
      const result = await updateAppointmentStatus({
        id: appointment.id,
        status,
        staffNote: note,
      });

      if (result.ok) {
        setIsSaved(true);
      } else {
        setError(result.error);
        setStatus(appointment.status);
      }
    });
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-ink-900 font-sans text-base font-semibold">
            {appointment.patientName}
          </h3>
          <p className="mt-1 text-sm">
            <a href={`tel:${appointment.phone.replace(/\s/g, '')}`} className="hover:text-ink-900">
              {appointment.phone}
            </a>
            {appointment.email ? (
              <>
                {' · '}
                <a href={`mailto:${appointment.email}`} className="hover:text-ink-900">
                  {appointment.email}
                </a>
              </>
            ) : null}
          </p>
        </div>

        <div className="text-right">
          <Badge tone={STATUS_TONES[appointment.status]}>{titleCase(appointment.status)}</Badge>
          <p className="text-ink-400 mt-1.5 text-xs">
            Received {formatDateTime(appointment.createdAt)}
          </p>
        </div>
      </div>

      <dl className="border-border mt-5 grid gap-4 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-ink-400 text-xs">Preferred date</dt>
          <dd className="text-ink-900 mt-0.5">{formatDate(appointment.preferredDate)}</dd>
        </div>
        <div>
          <dt className="text-ink-400 text-xs">Time of day</dt>
          <dd className="text-ink-900 mt-0.5">{SLOT_LABELS[appointment.preferredSlot]}</dd>
        </div>
        <div>
          <dt className="text-ink-400 text-xs">Doctor requested</dt>
          <dd className="text-ink-900 mt-0.5">{appointment.doctorName ?? 'No preference'}</dd>
        </div>
        <div>
          <dt className="text-ink-400 text-xs">Service</dt>
          <dd className="text-ink-900 mt-0.5">{appointment.serviceName ?? 'General'}</dd>
        </div>
      </dl>

      <div className="bg-surface-2 rounded-field mt-4 p-4">
        <p className="text-ink-400 text-xs">Reason given by the patient</p>
        <p className="text-ink-700 mt-1.5 text-sm leading-relaxed">{appointment.reason}</p>
      </div>

      {error ? (
        <div className="mt-4">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      ) : null}

      <div className="border-border mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end">
        <label className="text-ink-400 flex-1 text-xs">
          Status
          <select
            value={status}
            disabled={isCancelled || isPending}
            onChange={(event) => setStatus(event.target.value as AppointmentStatus)}
            className="border-border-strong bg-surface text-ink-900 disabled:bg-surface-3 rounded-field mt-1 w-full border px-3 py-2 text-sm"
          >
            {APPOINTMENT_STATUSES.map((option) => (
              <option key={option} value={option}>
                {titleCase(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-ink-400 flex-[2] text-xs">
          Staff note
          <input
            type="text"
            value={note}
            disabled={isCancelled || isPending}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Called, offered Thursday 10am."
            className="border-border-strong bg-surface text-ink-900 disabled:bg-surface-3 rounded-field mt-1 w-full border px-3 py-2 text-sm"
          />
        </label>

        <Button type="button" onClick={save} disabled={isCancelled || isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {isCancelled ? (
        <p className="text-ink-400 mt-3 text-xs">
          Cancelled requests are read-only. Ask the patient to submit a new request.
        </p>
      ) : null}

      {isSaved ? (
        <p role="status" className="text-success-600 mt-3 text-xs font-medium">
          Saved.
        </p>
      ) : null}
    </Card>
  );
}
