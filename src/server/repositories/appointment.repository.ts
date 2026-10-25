import type { AppointmentRequest, AppointmentStatus, Prisma } from '@prisma/client';
import { prisma } from '../db';

export type AppointmentWithRefs = Prisma.AppointmentRequestGetPayload<{
  include: { doctor: { select: { id: true; name: true } }; service: { select: { name: true } } };
}>;

const withRefs = {
  doctor: { select: { id: true, name: true } },
  service: { select: { name: true } },
} satisfies Prisma.AppointmentRequestInclude;

export const create = (data: Prisma.AppointmentRequestCreateInput): Promise<AppointmentRequest> =>
  prisma.appointmentRequest.create({ data });

export const findPage = async (filters: {
  status?: AppointmentStatus;
  page: number;
  limit: number;
}): Promise<{ rows: AppointmentWithRefs[]; total: number }> => {
  const where: Prisma.AppointmentRequestWhereInput = filters.status
    ? { status: filters.status }
    : {};

  const [rows, total] = await Promise.all([
    prisma.appointmentRequest.findMany({
      where,
      include: withRefs,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.appointmentRequest.count({ where }),
  ]);

  return { rows, total };
};

export const countByStatus = async (): Promise<Record<AppointmentStatus, number>> => {
  const groups = await prisma.appointmentRequest.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const counts = {
    NEW: 0,
    CONTACTED: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  } satisfies Record<AppointmentStatus, number>;

  for (const group of groups) {
    counts[group.status] = group._count._all;
  }

  return counts;
};

export const findById = (id: string): Promise<AppointmentRequest | null> =>
  prisma.appointmentRequest.findUnique({ where: { id } });

export const update = (
  id: string,
  data: Prisma.AppointmentRequestUpdateInput,
): Promise<AppointmentRequest> => prisma.appointmentRequest.update({ where: { id }, data });

/**
 * Counts recent requests from the same phone number, compared by digits only.
 *
 * Matching the string as typed missed "+91 98450 00000" against
 * "+919845000000" — the same patient, two rows for staff to reconcile. The
 * comparison is pushed into SQL because Prisma cannot strip characters in a
 * `where`; `digits` is already digit-only, so nothing user-supplied reaches
 * the pattern.
 */
export const countRecentByPhone = async (digits: string, since: Date): Promise<number> => {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count
    FROM appointment_requests
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') = ${digits}
      AND "createdAt" >= ${since}
  `;

  return Number(rows[0]?.count ?? 0);
};
