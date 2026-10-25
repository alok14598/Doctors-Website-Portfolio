import type { Doctor, Prisma } from '@prisma/client';
import { prisma } from '../db';

const publicWhere = (includeInactive: boolean): Prisma.DoctorWhereInput =>
  includeInactive ? {} : { isActive: true };

const byDisplayOrder: Prisma.DoctorOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { name: 'asc' },
];

export type DoctorWithSpecialty = Prisma.DoctorGetPayload<{ include: { specialty: true } }>;

export type DoctorWithDetail = Prisma.DoctorGetPayload<{
  include: { specialty: true; services: { include: { service: true } } };
}>;

export const findMany = (options?: {
  includeInactive?: boolean;
  specialtySlug?: string;
}): Promise<DoctorWithSpecialty[]> =>
  prisma.doctor.findMany({
    where: {
      ...publicWhere(options?.includeInactive ?? false),
      ...(options?.specialtySlug ? { specialty: { slug: options.specialtySlug } } : {}),
    },
    include: { specialty: true },
    orderBy: byDisplayOrder,
  });

export const findFeatured = (limit: number): Promise<DoctorWithSpecialty[]> =>
  prisma.doctor.findMany({
    where: { isActive: true },
    include: { specialty: true },
    orderBy: byDisplayOrder,
    take: limit,
  });

export const findBySlug = (
  slug: string,
  includeInactive = false,
): Promise<DoctorWithDetail | null> =>
  prisma.doctor.findFirst({
    where: { slug, ...publicWhere(includeInactive) },
    include: {
      specialty: true,
      services: {
        where: includeInactive ? {} : { service: { isActive: true } },
        include: { service: true },
        orderBy: { service: { sortOrder: 'asc' } },
      },
    },
  });

export const findSlugs = async (): Promise<string[]> => {
  const rows = await prisma.doctor.findMany({ where: { isActive: true }, select: { slug: true } });
  return rows.map((row) => row.slug);
};

export const findById = (id: string): Promise<Doctor | null> =>
  prisma.doctor.findUnique({ where: { id } });

export const create = (data: Prisma.DoctorCreateInput): Promise<Doctor> =>
  prisma.doctor.create({ data });

export const update = (id: string, data: Prisma.DoctorUpdateInput): Promise<Doctor> =>
  prisma.doctor.update({ where: { id }, data });

export const countBySlug = (slug: string, excludeId?: string): Promise<number> =>
  prisma.doctor.count({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } });

export const replaceServices = async (doctorId: string, serviceIds: string[]): Promise<void> => {
  await prisma.$transaction([
    prisma.doctorService.deleteMany({ where: { doctorId } }),
    prisma.doctorService.createMany({
      data: serviceIds.map((serviceId) => ({ doctorId, serviceId })),
    }),
  ]);
};

/** All doctor→service links, for the admin editor's pre-checked boxes. */
export const findAllServiceLinks = (): Promise<{ doctorId: string; serviceId: string }[]> =>
  prisma.doctorService.findMany({ select: { doctorId: true, serviceId: true } });
