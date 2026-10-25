import type { Service } from '@prisma/client';
import { AppError } from '@/lib/errors';
import {
  serviceFormSchema,
  toggleServiceSchema,
  updateServiceSchema,
  SERVICE_CATEGORIES,
  type ServiceFormInput,
  type UpdateServiceInput,
} from '@/lib/schemas';
import * as repo from '../repositories/service.repository';

export const listServices = (includeInactive = false) => repo.findMany(includeInactive);

export const getServiceBySlug = async (
  slug: string,
  includeInactive = false,
): Promise<repo.ServiceWithDoctors> => {
  const service = await repo.findBySlug(slug, includeInactive);
  if (!service) throw AppError.notFound('That service');
  return service;
};

export const listServiceSlugs = () => repo.findSlugs();

/**
 * Services grouped for the public listing, in the fixed category order from the
 * schema rather than alphabetically — consultations belong above dental care.
 */
export const listServicesByCategory = async () => {
  const services = await repo.findMany();

  return SERVICE_CATEGORIES.map((category) => ({
    category,
    items: services.filter((service) => service.category === category),
  })).filter((group) => group.items.length > 0);
};

const assertSlugAvailable = async (slug: string, excludeId?: string): Promise<void> => {
  const clashes = await repo.countBySlug(slug, excludeId);
  if (clashes > 0) {
    throw new AppError('CONFLICT', `The web address "/services/${slug}" is already in use.`);
  }
};

export const createService = async (input: ServiceFormInput): Promise<Service> => {
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) {
    throw AppError.validation(parsed.error.issues[0]?.message ?? 'Please check the form.');
  }

  await assertSlugAvailable(parsed.data.slug);

  return repo.create(parsed.data);
};

export const updateService = async (input: UpdateServiceInput): Promise<Service> => {
  const parsed = updateServiceSchema.safeParse(input);
  if (!parsed.success) {
    throw AppError.validation(parsed.error.issues[0]?.message ?? 'Please check the form.');
  }

  const { id, ...data } = parsed.data;

  const existing = await repo.findById(id);
  if (!existing) throw AppError.notFound('That service');

  await assertSlugAvailable(data.slug, id);

  return repo.update(id, data);
};

export const setServiceActive = async (input: {
  id: string;
  isActive: boolean | string;
}): Promise<Service> => {
  const parsed = toggleServiceSchema.safeParse(input);
  if (!parsed.success) throw AppError.validation('Could not update that service.');

  const existing = await repo.findById(parsed.data.id);
  if (!existing) throw AppError.notFound('That service');

  return repo.update(parsed.data.id, { isActive: parsed.data.isActive });
};

/** The service's current slug, read before an update so a rename can clear the
 * old URL from the cache. Returns null rather than throwing for an unknown id;
 * the update itself reports that. */
export const getServiceSlugById = async (id: string): Promise<string | null> =>
  (await repo.findById(id))?.slug ?? null;
