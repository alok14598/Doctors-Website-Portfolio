import { z } from 'zod';
import { cuidSchema, formBoolean, optionalText, slugSchema, sortOrderSchema } from './common';

export const SERVICE_CATEGORIES = [
  'CONSULTATION',
  'DIAGNOSTICS',
  'PROCEDURE',
  'PREVENTIVE',
  'DENTAL',
] as const;

export const SERVICE_CATEGORY_LABELS: Record<(typeof SERVICE_CATEGORIES)[number], string> = {
  CONSULTATION: 'Consultations',
  DIAGNOSTICS: 'Diagnostics & Imaging',
  PROCEDURE: 'Procedures',
  PREVENTIVE: 'Preventive Care',
  DENTAL: 'Dental Care',
};

export const serviceFormSchema = z.object({
  name: z.string().trim().min(3, 'Please name the service').max(120),
  slug: slugSchema,
  summary: z.string().trim().min(20, 'One sentence patients will see in lists').max(300),
  description: z.string().trim().min(60, 'Explain what the service involves').max(4000),
  category: z.enum(SERVICE_CATEGORIES),
  durationMinutes: z
    .union([z.coerce.number().int().min(5).max(480), z.literal('')])
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  preparation: optionalText(1000),
  sortOrder: sortOrderSchema,
  isActive: formBoolean(true),
});

export type ServiceFormInput = z.input<typeof serviceFormSchema>;
export type ServiceFormParsed = z.output<typeof serviceFormSchema>;

export const updateServiceSchema = serviceFormSchema.extend({ id: cuidSchema });
export type UpdateServiceInput = z.input<typeof updateServiceSchema>;

export const toggleServiceSchema = z.object({
  id: cuidSchema,
  isActive: formBoolean(true),
});
