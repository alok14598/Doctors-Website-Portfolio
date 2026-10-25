import type { Facility, Faq, Specialty, Testimonial } from '@prisma/client';
import { prisma } from '../db';

export const findSpecialties = (): Promise<Specialty[]> =>
  prisma.specialty.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });

export const findFacilities = (includeInactive = false): Promise<Facility[]> =>
  prisma.facility.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

export const findTestimonials = (limit?: number): Promise<Testimonial[]> =>
  prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    ...(limit ? { take: limit } : {}),
  });

export const findFaqs = (): Promise<Faq[]> =>
  prisma.faq.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });
