import Link from 'next/link';
import { AppointmentRow } from '@/components/admin/AppointmentRow';
import { EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/cn';
import { titleCase } from '@/lib/format';
import { APPOINTMENT_STATUSES } from '@/lib/schemas';
import { listAppointments } from '@/server/services/appointment.service';

export const metadata = { title: 'Appointment requests' };

type Props = { searchParams: Promise<{ status?: string; page?: string }> };

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  const params = await searchParams;

  const status = APPOINTMENT_STATUSES.find((option) => option === params.status);
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const { items, counts, total, totalPages } = await listAppointments({ status, page });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Appointment requests</h1>
          <p className="mt-2 text-sm">
            {counts.NEW > 0
              ? `${counts.NEW} request${counts.NEW === 1 ? '' : 's'} waiting for a callback.`
              : 'Nothing is waiting for a callback.'}
          </p>
        </div>
      </div>

      <nav aria-label="Filter by status" className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/admin/appointments"
          aria-current={status ? undefined : 'page'}
          className={cn(
            'rounded-pill ease-smooth px-4 py-2 text-sm transition-all duration-200',
            status
              ? 'bg-surface-2 text-ink-600 hover:bg-surface-3 hover:text-ink-900'
              : 'bg-ink-900 text-white',
          )}
        >
          All
        </Link>
        {APPOINTMENT_STATUSES.map((option) => {
          const isActive = status === option;
          return (
            <Link
              key={option}
              href={`/admin/appointments?status=${option}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'rounded-pill ease-smooth px-4 py-2 text-sm transition-all duration-200',
                isActive
                  ? 'bg-ink-900 text-white'
                  : 'bg-surface-2 text-ink-600 hover:bg-surface-3 hover:text-ink-900',
              )}
            >
              {titleCase(option)}
              <span className={cn('ml-2 text-xs', isActive ? 'text-white/80' : 'text-ink-400')}>
                {counts[option]}
              </span>
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No requests here"
            description={
              status
                ? 'Nothing currently has this status.'
                : 'Requests submitted through the website appear here.'
            }
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <AppointmentRow
                appointment={{
                  id: item.id,
                  patientName: item.patientName,
                  phone: item.phone,
                  email: item.email,
                  preferredDate: item.preferredDate.toISOString(),
                  preferredSlot: item.preferredSlot,
                  reason: item.reason,
                  status: item.status,
                  staffNote: item.staffNote,
                  createdAt: item.createdAt.toISOString(),
                  doctorName: item.doctor?.name ?? null,
                  serviceName: item.service?.name ?? null,
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-sm">
          <span className="text-ink-400">
            Page {page} of {totalPages} · {total} total
          </span>
          <span className="flex gap-3">
            {page > 1 ? (
              <Link
                href={`/admin/appointments?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page - 1) })}`}
                className="text-accent-700 font-medium hover:underline"
              >
                ← Newer
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/admin/appointments?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page + 1) })}`}
                className="text-accent-700 font-medium hover:underline"
              >
                Older →
              </Link>
            ) : null}
          </span>
        </nav>
      ) : null}
    </>
  );
}
