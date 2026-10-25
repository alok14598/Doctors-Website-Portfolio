import { describe, expect, it } from 'vitest';
import { prisma } from '@/server/db';
import * as service from './clinic.service';

const createProfile = () =>
  prisma.clinicProfile.create({
    data: {
      name: 'Test Clinic',
      tagline: 'Care, carefully.',
      about: 'About the clinic.',
      addressLine1: '1 Test Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560095',
      phone: '+91 80 0000 0000',
      email: 'care@example.com',
    },
  });

describe('getClinicProfile', () => {
  it('returns the singleton profile', async () => {
    await createProfile();

    const profile = await service.getClinicProfile();

    expect(profile.name).toBe('Test Clinic');
  });

  it('fails loudly when the database was never seeded', async () => {
    await expect(service.getClinicProfile()).rejects.toThrow(/db:seed/i);
  });
});

describe('getOpeningHours', () => {
  it('returns the week starting Monday and ending Sunday', async () => {
    await prisma.openingHour.createMany({
      data: [
        { dayOfWeek: 0, isClosed: true },
        { dayOfWeek: 6, opensAt: '09:00', closesAt: '14:00' },
        { dayOfWeek: 1, opensAt: '09:00', closesAt: '20:00' },
      ],
    });

    const hours = await service.getOpeningHours();

    expect(hours.map((hour) => hour.dayOfWeek)).toEqual([1, 6, 0]);
  });
});

describe('getFacilitiesByCategory', () => {
  it('groups facilities and omits inactive ones', async () => {
    await prisma.facility.createMany({
      data: [
        { name: 'X-ray', description: 'Digital X-ray.', category: 'DIAGNOSTICS', sortOrder: 1 },
        { name: 'Lab', description: 'On-site lab.', category: 'DIAGNOSTICS', sortOrder: 2 },
        { name: 'Parking', description: 'Basement bays.', category: 'AMENITY', sortOrder: 3 },
        {
          name: 'Old Scanner',
          description: 'Decommissioned.',
          category: 'DIAGNOSTICS',
          isActive: false,
        },
      ],
    });

    const groups = await service.getFacilitiesByCategory();

    expect(groups).toHaveLength(2);
    expect(groups[0]?.items.map((item) => item.name)).toEqual(['X-ray', 'Lab']);
  });
});

describe('getTestimonials', () => {
  it('returns only published testimonials', async () => {
    await prisma.testimonial.createMany({
      data: [
        { patientName: 'Visible', rating: 5, quote: 'Great care.', isPublished: true },
        { patientName: 'Hidden', rating: 2, quote: 'Not approved.', isPublished: false },
      ],
    });

    const testimonials = await service.getTestimonials();

    expect(testimonials.map((item) => item.patientName)).toEqual(['Visible']);
  });

  it('respects the limit', async () => {
    await prisma.testimonial.createMany({
      data: [1, 2, 3].map((index) => ({
        patientName: `Patient ${index}`,
        rating: 5,
        quote: 'Good.',
        isPublished: true,
        sortOrder: index,
      })),
    });

    const testimonials = await service.getTestimonials(2);

    expect(testimonials).toHaveLength(2);
  });
});

describe('getFaqsByCategory', () => {
  it('groups FAQs by category', async () => {
    await prisma.faq.createMany({
      data: [
        { question: 'Q1', answer: 'A1', category: 'APPOINTMENTS', sortOrder: 1 },
        { question: 'Q2', answer: 'A2', category: 'APPOINTMENTS', sortOrder: 2 },
        { question: 'Q3', answer: 'A3', category: 'PAYMENTS', sortOrder: 1 },
      ],
    });

    const groups = await service.getFaqsByCategory();

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.category === 'APPOINTMENTS')?.items).toHaveLength(2);
  });
});
