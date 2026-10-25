import type { Doctor } from '@prisma/client';
import { AppError } from '@/lib/errors';
import {
  doctorFormSchema,
  toggleDoctorSchema,
  updateDoctorSchema,
  type DoctorFormInput,
  type UpdateDoctorInput,
} from '@/lib/schemas';
import * as repo from '../repositories/doctor.repository';
import * as contentRepo from '../repositories/content.repository';

export const FEATURED_DOCTOR_COUNT = 3;

export const listDoctors = (options?: { specialtySlug?: string; includeInactive?: boolean }) =>
  repo.findMany(options);

export const listFeaturedDoctors = () => repo.findFeatured(FEATURED_DOCTOR_COUNT);

export const getDoctorBySlug = async (
  slug: string,
  includeInactive = false,
): Promise<repo.DoctorWithDetail> => {
  const doctor = await repo.findBySlug(slug, includeInactive);
  if (!doctor) throw AppError.notFound('That doctor');
  return doctor;
};

export const listDoctorSlugs = () => repo.findSlugs();

/**
 * Specialties the public directory should offer as filters — only those with
 * at least one practising doctor, so a filter never leads to an empty page.
 */
export const listFilterableSpecialties = async () => {
  const [specialties, doctors] = await Promise.all([
    contentRepo.findSpecialties(),
    repo.findMany(),
  ]);

  const populated = new Set(doctors.map((doctor) => doctor.specialtyId));

  return specialties.filter((specialty) => populated.has(specialty.id));
};

const assertSlugAvailable = async (slug: string, excludeId?: string): Promise<void> => {
  const clashes = await repo.countBySlug(slug, excludeId);
  if (clashes > 0) {
    throw new AppError('CONFLICT', `The web address "/doctors/${slug}" is already in use.`);
  }
};

export const createDoctor = async (
  input: DoctorFormInput,
  serviceIds: string[] = [],
): Promise<Doctor> => {
  const parsed = doctorFormSchema.safeParse(input);
  if (!parsed.success) {
    throw AppError.validation(parsed.error.issues[0]?.message ?? 'Please check the form.');
  }

  const { specialtyId, ...data } = parsed.data;
  await assertSlugAvailable(data.slug);

  const doctor = await repo.create({ ...data, specialty: { connect: { id: specialtyId } } });
  if (serviceIds.length > 0) await repo.replaceServices(doctor.id, serviceIds);

  return doctor;
};

export const updateDoctor = async (
  input: UpdateDoctorInput,
  serviceIds?: string[],
): Promise<Doctor> => {
  const parsed = updateDoctorSchema.safeParse(input);
  if (!parsed.success) {
    throw AppError.validation(parsed.error.issues[0]?.message ?? 'Please check the form.');
  }

  const { id, specialtyId, ...data } = parsed.data;

  const existing = await repo.findById(id);
  if (!existing) throw AppError.notFound('That doctor');

  await assertSlugAvailable(data.slug, id);

  const doctor = await repo.update(id, { ...data, specialty: { connect: { id: specialtyId } } });
  if (serviceIds) await repo.replaceServices(id, serviceIds);

  return doctor;
};

/** Soft hide rather than delete: appointment history must keep pointing at a row. */
export const setDoctorActive = async (input: {
  id: string;
  isActive: boolean | string;
}): Promise<Doctor> => {
  const parsed = toggleDoctorSchema.safeParse(input);
  if (!parsed.success) throw AppError.validation('Could not update that doctor.');

  const existing = await repo.findById(parsed.data.id);
  if (!existing) throw AppError.notFound('That doctor');

  return repo.update(parsed.data.id, { isActive: parsed.data.isActive });
};

/** Service ids keyed by doctor id, so the admin editor can pre-check boxes. */
export const getServiceIdsByDoctor = async (): Promise<Map<string, string[]>> => {
  const links = await repo.findAllServiceLinks();

  const byDoctor = new Map<string, string[]>();
  for (const link of links) {
    byDoctor.set(link.doctorId, [...(byDoctor.get(link.doctorId) ?? []), link.serviceId]);
  }

  return byDoctor;
};

/** The doctor's current slug, read before an update so a rename can clear the
 * old URL from the cache. Returns null rather than throwing for an unknown id;
 * the update itself reports that. */
export const getDoctorSlugById = async (id: string): Promise<string | null> =>
  (await repo.findById(id))?.slug ?? null;
