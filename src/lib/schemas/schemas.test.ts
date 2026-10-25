import { describe, expect, it } from 'vitest';
import {
  appointmentRequestSchema,
  doctorFormSchema,
  formBoolean,
  localImagePath,
  serviceFormSchema,
} from './index';

const doctorForm = {
  name: 'Dr. Nilesh Kamat',
  slug: 'nilesh-kamat',
  designation: 'Consultant Physician',
  specialtyId: 'spec1',
  qualifications: 'MBBS, MD (General Medicine)',
  bio: 'A biography that comfortably clears the forty character minimum for a profile.',
  experienceYears: '12',
  languages: 'English, Hindi',
  consultingDays: [1, 3],
  sortOrder: '1',
  isActive: true,
};

describe('doctorFormSchema', () => {
  it('parses its own output, so the client and server can both validate', () => {
    const once = doctorFormSchema.parse(doctorForm);
    const twice = doctorFormSchema.parse(once);

    expect(twice).toEqual(once);
  });

  it('splits a comma list and drops the gaps', () => {
    const parsed = doctorFormSchema.parse({
      ...doctorForm,
      qualifications: 'MBBS,  , MD (Paediatrics),',
    });

    expect(parsed.qualifications).toEqual(['MBBS', 'MD (Paediatrics)']);
  });
});

describe('serviceFormSchema', () => {
  it('parses its own output', () => {
    const once = serviceFormSchema.parse({
      name: 'Allergy Testing',
      slug: 'allergy-testing',
      summary: 'Skin-prick testing for common inhaled and food allergens.',
      description: 'A panel of common allergens is applied and read after twenty minutes.',
      category: 'DIAGNOSTICS',
      durationMinutes: '45',
      sortOrder: '2',
      isActive: true,
    });

    expect(serviceFormSchema.parse(once)).toEqual(once);
  });
});

describe('formBoolean', () => {
  const schema = formBoolean(true);

  it('reads checkbox and string values as the author intended', () => {
    expect(schema.parse('on')).toBe(true);
    expect(schema.parse('true')).toBe(true);
    expect(schema.parse(true)).toBe(true);
  });

  it('reads "false" as false — the bug z.coerce.boolean() would introduce', () => {
    expect(schema.parse('false')).toBe(false);
    expect(schema.parse('')).toBe(false);
    expect(schema.parse(false)).toBe(false);
  });

  it('falls back to the default when the field is absent', () => {
    expect(schema.parse(undefined)).toBe(true);
  });
});

describe('appointmentRequestSchema', () => {
  const tomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  };

  const base = {
    patientName: 'Asha Patel',
    phone: '+91 98450 00000',
    preferredDate: tomorrow(),
    preferredSlot: 'MORNING' as const,
    reason: 'Persistent cough for the last two weeks, worse at night.',
  };

  it('treats a blank email as not supplied rather than invalid', () => {
    expect(appointmentRequestSchema.parse({ ...base, email: '' }).email).toBeUndefined();
  });

  it('rejects a malformed email', () => {
    expect(appointmentRequestSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(
      false,
    );
  });

  it('rejects a phone number containing letters', () => {
    expect(appointmentRequestSchema.safeParse({ ...base, phone: 'call me' }).success).toBe(false);
  });

  it('rejects a date beyond the booking horizon', () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 200);

    const result = appointmentRequestSchema.safeParse({
      ...base,
      preferredDate: farFuture.toISOString().slice(0, 10),
    });

    expect(result.success).toBe(false);
  });

  it('accepts today', () => {
    const today = new Date().toISOString().slice(0, 10);

    expect(appointmentRequestSchema.safeParse({ ...base, preferredDate: today }).success).toBe(
      true,
    );
  });
});

describe('localImagePath', () => {
  it('accepts an app-rooted path', () => {
    expect(localImagePath.parse('/doctors/ananya-rao.jpg')).toBe('/doctors/ananya-rao.jpg');
  });

  it('treats a blank value as not supplied', () => {
    expect(localImagePath.parse('')).toBeUndefined();
  });

  it('rejects a remote URL, which next/image would refuse at render time', () => {
    const result = localImagePath.safeParse('https://images.example.com/dr.jpg');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/public/i);
  });

  it('rejects a protocol-relative URL and a bare relative path', () => {
    expect(localImagePath.safeParse('//images.example.com/dr.jpg').success).toBe(false);
    expect(localImagePath.safeParse('doctors/ananya.jpg').success).toBe(false);
  });
});
