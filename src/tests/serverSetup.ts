import { beforeEach } from 'vitest';
import { prisma } from '@/server/db';

/**
 * Every server test starts from an empty database. Truncating is faster than
 * per-test transactions and keeps the tests honest about constraints and
 * cascades, which a rolled-back transaction can hide.
 */
const TABLES = [
  'appointment_requests',
  'doctor_services',
  'doctors',
  'services',
  'specialties',
  'facilities',
  'testimonials',
  'faqs',
  'opening_hours',
  'clinic_profiles',
  'admin_users',
] as const;

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((table) => `"${table}"`).join(', ')} CASCADE`,
  );
});
