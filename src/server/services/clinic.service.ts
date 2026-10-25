import type { ClinicProfile, OpeningHour } from '@prisma/client';
import { AppError } from '@/lib/errors';
import * as repo from '../repositories/clinic.repository';
import * as contentRepo from '../repositories/content.repository';

/**
 * Every page needs the clinic profile. A missing row means the database was
 * never seeded, which is a setup failure rather than a 404 — so it throws
 * loudly instead of rendering a page with blank contact details.
 */
export const getClinicProfile = async (): Promise<ClinicProfile> => {
  const profile = await repo.findProfile();
  if (!profile) {
    throw new AppError(
      'INTERNAL',
      'The clinic profile has not been set up. Run `npm run db:seed`.',
    );
  }
  return profile;
};

export const getOpeningHours = (): Promise<OpeningHour[]> => repo.findOpeningHours();

export const getFacilities = () => contentRepo.findFacilities();

export const getTestimonials = (limit?: number) => contentRepo.findTestimonials(limit);

export const getSpecialties = () => contentRepo.findSpecialties();

/** FAQs grouped by category, in the category order the schema declares. */
export const getFaqsByCategory = async () => {
  const faqs = await contentRepo.findFaqs();

  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const existing = groups.get(faq.category);
    if (existing) {
      existing.push(faq);
    } else {
      groups.set(faq.category, [faq]);
    }
  }

  return [...groups.entries()].map(([category, items]) => ({ category, items }));
};

export const getFacilitiesByCategory = async () => {
  const facilities = await contentRepo.findFacilities();

  const groups = new Map<string, typeof facilities>();
  for (const facility of facilities) {
    const existing = groups.get(facility.category);
    if (existing) {
      existing.push(facility);
    } else {
      groups.set(facility.category, [facility]);
    }
  }

  return [...groups.entries()].map(([category, items]) => ({ category, items }));
};

/** Flat FAQ list, used for the FAQPage structured data on /patient-info. */
export const getFaqsFlat = async (): Promise<{ question: string; answer: string }[]> => {
  const faqs = await contentRepo.findFaqs();
  return faqs.map((faq) => ({ question: faq.question, answer: faq.answer }));
};
