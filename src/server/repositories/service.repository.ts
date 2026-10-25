import type { Prisma, Service } from '@prisma/client';
import { prisma } from '../db';

const publicWhere = (includeInactive: boolean): Prisma.ServiceWhereInput =>
  includeInactive ? {} : { isActive: true };

const byDisplayOrder: Prisma.ServiceOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { name: 'asc' },
];

export const findMany = (includeInactive = false): Promise<Service[]> =>
  prisma.service.findMany({ where: publicWhere(includeInactive), orderBy: byDisplayOrder });

export type ServiceWithDoctors = Prisma.ServiceGetPayload<{
  include: { doctors: { include: { doctor: { include: { specialty: true } } } } };
}>;

export const findBySlug = (
  slug: string,
  includeInactive = false,
): Promise<ServiceWithDoctors | null> =>
  prisma.service.findFirst({
    where: { slug, ...publicWhere(includeInactive) },
    include: {
      doctors: {
        where: includeInactive ? {} : { doctor: { isActive: true } },
        include: { doctor: { include: { specialty: true } } },
        orderBy: { doctor: { sortOrder: 'asc' } },
      },
    },
  });

export const findSlugs = async (): Promise<string[]> => {
  const rows = await prisma.service.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
};

export const findById = (id: string): Promise<Service | null> =>
  prisma.service.findUnique({ where: { id } });

export const create = (data: Prisma.ServiceCreateInput): Promise<Service> =>
  prisma.service.create({ data });

export const update = (id: string, data: Prisma.ServiceUpdateInput): Promise<Service> =>
  prisma.service.update({ where: { id }, data });

export const countBySlug = (slug: string, excludeId?: string): Promise<number> =>
  prisma.service.count({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } });
