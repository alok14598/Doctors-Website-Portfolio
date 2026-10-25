import type { ClinicProfile, OpeningHour } from '@prisma/client';

/**
 * In-memory fixtures for tests that render components rather than touch the
 * database. Kept in one place so a new column on ClinicProfile is a single
 * edit, not a hunt through every component test.
 */
export const clinicProfile = (overrides: Partial<ClinicProfile> = {}): ClinicProfile => ({
  id: 'clinic-1',
  name: 'Meridian Family Clinic',
  tagline: 'Everyday care, delivered carefully.',
  about: 'The opening paragraph patients read first.\n\nA second paragraph they do not.',
  mission: null,
  addressLine1: '2nd Floor, Meridian House',
  addressLine2: '18th Main Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560095',
  country: 'India',
  phone: '+91 80 4567 8900',
  altPhone: null,
  email: 'care@example.com',
  mapEmbedUrl: null,
  emergencyNote: 'For chest pain, call 108.',
  heroTitle: null,
  heroTitleAccent: null,
  heroImageUrl: null,
  accreditations: ['NABH Entry-Level Certified'],
  foundedYear: 2011,
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

export const openingHour = (
  dayOfWeek: number,
  overrides: Partial<OpeningHour> = {},
): OpeningHour => ({
  id: `hour-${dayOfWeek}`,
  dayOfWeek,
  isClosed: false,
  opensAt: '09:00',
  closesAt: '20:00',
  note: null,
  ...overrides,
});
