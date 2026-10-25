import { describe, expect, it } from 'vitest';
import { createDoctor, createService, createSpecialty } from '@/tests/factories';
import { prisma } from '@/server/db';
import * as service from './doctor.service';

const validForm = (overrides: Record<string, unknown> = {}) => ({
  name: 'Dr. Nilesh Kamat',
  slug: 'nilesh-kamat',
  designation: 'Consultant Physician',
  specialtyId: '',
  qualifications: 'MBBS, MD (General Medicine)',
  bio: 'A biography that comfortably clears the forty character minimum for a doctor profile.',
  photoUrl: '',
  experienceYears: '12',
  languages: 'English, Hindi',
  registrationNo: 'KMC/2012/00001',
  consultingDays: [1, 3],
  consultingHours: '9:00 am – 1:00 pm',
  sortOrder: '1',
  isActive: true,
  ...overrides,
});

describe('listDoctors', () => {
  it('hides doctors who no longer practise here', async () => {
    await createDoctor({ name: 'Dr. Current' });
    await createDoctor({ name: 'Dr. Departed', isActive: false });

    const doctors = await service.listDoctors();

    expect(doctors.map((doctor) => doctor.name)).toEqual(['Dr. Current']);
  });

  it('includes inactive doctors for the admin view', async () => {
    await createDoctor({ isActive: false });

    const doctors = await service.listDoctors({ includeInactive: true });

    expect(doctors).toHaveLength(1);
  });

  it('filters by specialty slug', async () => {
    const paediatrics = await createSpecialty({ slug: 'paediatrics' });
    const dermatology = await createSpecialty({ slug: 'dermatology' });
    await createDoctor({ name: 'Dr. Child', specialtyId: paediatrics.id });
    await createDoctor({ name: 'Dr. Skin', specialtyId: dermatology.id });

    const doctors = await service.listDoctors({ specialtySlug: 'paediatrics' });

    expect(doctors.map((doctor) => doctor.name)).toEqual(['Dr. Child']);
  });

  it('orders by sortOrder before name', async () => {
    await createDoctor({ name: 'Dr. Aaa', sortOrder: 2 });
    await createDoctor({ name: 'Dr. Zzz', sortOrder: 1 });

    const doctors = await service.listDoctors();

    expect(doctors.map((doctor) => doctor.name)).toEqual(['Dr. Zzz', 'Dr. Aaa']);
  });
});

describe('getDoctorBySlug', () => {
  it('returns the doctor with specialty and services', async () => {
    const doctor = await createDoctor({ slug: 'asha-menon' });
    const clinicService = await createService();
    await prisma.doctorService.create({
      data: { doctorId: doctor.id, serviceId: clinicService.id },
    });

    const found = await service.getDoctorBySlug('asha-menon');

    expect(found.specialty).toBeTruthy();
    expect(found.services).toHaveLength(1);
  });

  it('throws NOT_FOUND for an unknown slug', async () => {
    await expect(service.getDoctorBySlug('nobody')).rejects.toThrow(/could not be found/i);
  });

  it('throws NOT_FOUND for an inactive doctor on the public site', async () => {
    await createDoctor({ slug: 'retired', isActive: false });

    await expect(service.getDoctorBySlug('retired')).rejects.toThrow(/could not be found/i);
  });

  it('omits services that have been withdrawn', async () => {
    const doctor = await createDoctor({ slug: 'partial' });
    const withdrawn = await createService({ isActive: false });
    await prisma.doctorService.create({ data: { doctorId: doctor.id, serviceId: withdrawn.id } });

    const found = await service.getDoctorBySlug('partial');

    expect(found.services).toHaveLength(0);
  });
});

describe('listFilterableSpecialties', () => {
  it('omits specialties with no practising doctor', async () => {
    const staffed = await createSpecialty({ slug: 'staffed' });
    await createSpecialty({ slug: 'empty' });
    await createDoctor({ specialtyId: staffed.id });

    const specialties = await service.listFilterableSpecialties();

    expect(specialties.map((specialty) => specialty.slug)).toEqual(['staffed']);
  });
});

describe('createDoctor', () => {
  it('splits comma-separated qualifications into a list', async () => {
    const specialty = await createSpecialty();

    const doctor = await service.createDoctor(validForm({ specialtyId: specialty.id }));

    expect(doctor.qualifications).toEqual(['MBBS', 'MD (General Medicine)']);
  });

  it('coerces the string form values the browser submits', async () => {
    const specialty = await createSpecialty();

    const doctor = await service.createDoctor(validForm({ specialtyId: specialty.id }));

    expect(doctor.experienceYears).toBe(12);
    expect(doctor.sortOrder).toBe(1);
  });

  it('turns a blank optional field into null rather than an empty string', async () => {
    const specialty = await createSpecialty();

    const doctor = await service.createDoctor(
      validForm({ specialtyId: specialty.id, photoUrl: '' }),
    );

    expect(doctor.photoUrl).toBeNull();
  });

  it('links the selected services', async () => {
    const specialty = await createSpecialty();
    const first = await createService();
    const second = await createService();

    const doctor = await service.createDoctor(validForm({ specialtyId: specialty.id }), [
      first.id,
      second.id,
    ]);

    const links = await prisma.doctorService.count({ where: { doctorId: doctor.id } });
    expect(links).toBe(2);
  });

  it('refuses a slug already in use', async () => {
    const specialty = await createSpecialty();
    await createDoctor({ slug: 'taken' });

    await expect(
      service.createDoctor(validForm({ specialtyId: specialty.id, slug: 'taken' })),
    ).rejects.toThrow(/already in use/i);
  });

  it('rejects a slug with spaces or capitals', async () => {
    const specialty = await createSpecialty();

    await expect(
      service.createDoctor(validForm({ specialtyId: specialty.id, slug: 'Dr Who' })),
    ).rejects.toThrow(/lowercase/i);
  });

  it('rejects a bio too short to help a patient choose', async () => {
    const specialty = await createSpecialty();

    await expect(
      service.createDoctor(validForm({ specialtyId: specialty.id, bio: 'Good doctor.' })),
    ).rejects.toThrow(/short paragraph/i);
  });
});

describe('updateDoctor', () => {
  it('allows a doctor to keep their own slug', async () => {
    const specialty = await createSpecialty();
    const doctor = await createDoctor({ slug: 'keeps-slug', specialtyId: specialty.id });

    const updated = await service.updateDoctor({
      ...validForm({ specialtyId: specialty.id, slug: 'keeps-slug' }),
      id: doctor.id,
    });

    expect(updated.slug).toBe('keeps-slug');
  });

  it('replaces the service links rather than appending to them', async () => {
    const specialty = await createSpecialty();
    const doctor = await createDoctor({ specialtyId: specialty.id });
    const first = await createService();
    const second = await createService();
    await prisma.doctorService.create({ data: { doctorId: doctor.id, serviceId: first.id } });

    await service.updateDoctor(
      { ...validForm({ specialtyId: specialty.id, slug: doctor.slug }), id: doctor.id },
      [second.id],
    );

    const links = await prisma.doctorService.findMany({ where: { doctorId: doctor.id } });
    expect(links.map((link) => link.serviceId)).toEqual([second.id]);
  });

  it('throws NOT_FOUND for an unknown id', async () => {
    const specialty = await createSpecialty();

    await expect(
      service.updateDoctor({ ...validForm({ specialtyId: specialty.id }), id: 'missing' }),
    ).rejects.toThrow(/could not be found/i);
  });
});

describe('setDoctorActive', () => {
  it('hides a doctor without deleting the row', async () => {
    const doctor = await createDoctor();

    await service.setDoctorActive({ id: doctor.id, isActive: false });

    const stillThere = await prisma.doctor.findUnique({ where: { id: doctor.id } });
    expect(stillThere?.isActive).toBe(false);
  });

  it('throws NOT_FOUND for an unknown id', async () => {
    await expect(service.setDoctorActive({ id: 'missing', isActive: false })).rejects.toThrow(
      /could not be found/i,
    );
  });
});
