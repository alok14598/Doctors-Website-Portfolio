import type { Doctor, Service, Specialty } from '@prisma/client';
import { prisma } from '@/server/db';

let counter = 0;
const unique = (prefix: string): string => `${prefix}-${++counter}`;

export const createSpecialty = (overrides: Partial<Specialty> = {}): Promise<Specialty> => {
  const slug = overrides.slug ?? unique('specialty');
  return prisma.specialty.create({
    data: { name: `Specialty ${slug}`, slug, sortOrder: 0, ...overrides },
  });
};

export const createService = (overrides: Partial<Service> = {}): Promise<Service> => {
  const slug = overrides.slug ?? unique('service');
  return prisma.service.create({
    data: {
      name: `Service ${slug}`,
      slug,
      summary: 'A short summary shown in the services list for this entry.',
      description:
        'A longer description of what this service involves, long enough to be realistic.',
      category: 'CONSULTATION',
      ...overrides,
    },
  });
};

export const createDoctor = async (
  overrides: Partial<Doctor> & { specialtyId?: string } = {},
): Promise<Doctor> => {
  const slug = overrides.slug ?? unique('doctor');
  const specialtyId = overrides.specialtyId ?? (await createSpecialty()).id;

  return prisma.doctor.create({
    data: {
      name: `Dr. ${slug}`,
      slug,
      designation: 'Consultant',
      bio: 'A biography long enough to pass the form schema minimum of forty characters.',
      experienceYears: 10,
      specialtyId,
      ...overrides,
    },
  });
};

/** A valid appointment request payload, as the form would submit it. */
export const appointmentPayload = (overrides: Record<string, unknown> = {}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    patientName: 'Asha Patel',
    phone: '+91 98450 00000',
    email: 'asha@example.com',
    preferredDate: tomorrow.toISOString().slice(0, 10),
    preferredSlot: 'MORNING' as const,
    reason: 'Persistent cough for the last two weeks, worse at night.',
    ...overrides,
  };
};
