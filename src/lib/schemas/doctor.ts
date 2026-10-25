import { z } from 'zod';
import {
  cuidSchema,
  formBoolean,
  localImagePath,
  optionalText,
  slugSchema,
  sortOrderSchema,
} from './common';

/**
 * Comma- or newline-separated text becomes a trimmed string array.
 *
 * It also accepts an array, so the schema can parse its own output. That makes
 * it safe for the client form to validate, send the parsed value, and have the
 * Server Action validate the same payload again with the same schema.
 */
const listFromText = (max: number) =>
  z.union([z.string().trim().max(max), z.array(z.string())]).transform((value) => {
    const items = Array.isArray(value) ? value : value.split(/[,\n]/);
    return items.map((item) => item.trim()).filter(Boolean);
  });

export const doctorFormSchema = z.object({
  name: z.string().trim().min(3, 'Please enter the full name').max(120),
  slug: slugSchema,
  designation: z.string().trim().min(3, 'e.g. Consultant Physician').max(120),
  specialtyId: cuidSchema,
  qualifications: listFromText(400),
  bio: z.string().trim().min(40, 'A short paragraph helps patients choose').max(3000),
  photoUrl: localImagePath,
  experienceYears: z.coerce.number().int().min(0).max(70),
  languages: listFromText(200),
  registrationNo: optionalText(60),
  consultingDays: z.array(z.coerce.number().int().min(0).max(6)).default([]),
  consultingHours: optionalText(120),
  sortOrder: sortOrderSchema,
  isActive: formBoolean(true),
});

export type DoctorFormInput = z.input<typeof doctorFormSchema>;
export type DoctorFormParsed = z.output<typeof doctorFormSchema>;

export const updateDoctorSchema = doctorFormSchema.extend({ id: cuidSchema });
export type UpdateDoctorInput = z.input<typeof updateDoctorSchema>;

export const toggleDoctorSchema = z.object({
  id: cuidSchema,
  isActive: formBoolean(true),
});
