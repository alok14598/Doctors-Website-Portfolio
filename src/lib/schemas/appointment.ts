import { z } from 'zod';
import { cuidSchema, optionalId, optionalText } from './common';

export const PREFERRED_SLOTS = ['MORNING', 'AFTERNOON', 'EVENING'] as const;
export const APPOINTMENT_STATUSES = [
  'NEW',
  'CONTACTED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
] as const;

export const SLOT_LABELS: Record<(typeof PREFERRED_SLOTS)[number], string> = {
  MORNING: 'Morning (9:00 am – 12:00 pm)',
  AFTERNOON: 'Afternoon (12:00 pm – 4:00 pm)',
  EVENING: 'Evening (4:00 pm – 8:00 pm)',
};

/** How far ahead a patient may request. Beyond this, staff ask them to call. */
export const MAX_DAYS_AHEAD = 90;

const todayAtMidnight = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

/**
 * The single source of truth for an appointment request. The client form and
 * the server action both parse with this, so a rule change breaks compilation
 * on whichever side has not caught up rather than at runtime.
 */
export const appointmentRequestSchema = z.object({
  patientName: z.string().trim().min(2, 'Please enter your full name').max(120, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a reachable phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+]?[\d\s()-]+$/, 'Use digits, spaces, and + ( ) - only'),
  email: z
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : value))
    .optional()
    .refine(
      (value) => value === undefined || z.string().email().safeParse(value).success,
      'Please enter a valid email address or leave it blank',
    ),
  preferredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a date')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Please choose a valid date')
    .refine((value) => new Date(value) >= todayAtMidnight(), 'Please choose today or a later date')
    .refine((value) => {
      const limit = todayAtMidnight();
      limit.setDate(limit.getDate() + MAX_DAYS_AHEAD);
      return new Date(value) <= limit;
    }, `Please choose a date within the next ${MAX_DAYS_AHEAD} days`),
  preferredSlot: z.enum(PREFERRED_SLOTS, { message: 'Please choose a time of day' }),
  doctorId: optionalId,
  serviceId: optionalId,
  reason: z
    .string()
    .trim()
    .min(10, 'Please tell us briefly why you would like to be seen')
    .max(1000, 'Please keep this under 1000 characters'),
});

export type AppointmentRequestInput = z.input<typeof appointmentRequestSchema>;
export type AppointmentRequestParsed = z.output<typeof appointmentRequestSchema>;

export const updateAppointmentStatusSchema = z.object({
  id: cuidSchema,
  status: z.enum(APPOINTMENT_STATUSES),
  staffNote: optionalText(1000),
});

export type UpdateAppointmentStatusInput = z.input<typeof updateAppointmentStatusSchema>;

/**
 * Read straight from the URL, so every field falls back rather than throwing.
 * `?page=1.5` previously reached `.int()` and surfaced as a 500 on the inbox.
 */
export const appointmentFilterSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export type AppointmentFilter = z.output<typeof appointmentFilterSchema>;
