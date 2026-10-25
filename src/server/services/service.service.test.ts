import { describe, expect, it } from 'vitest';
import { createDoctor, createService } from '@/tests/factories';
import { prisma } from '@/server/db';
import * as service from './service.service';

const validForm = (overrides: Record<string, unknown> = {}) => ({
  name: 'Allergy Testing',
  slug: 'allergy-testing',
  summary: 'Skin-prick testing for common inhaled and food allergens.',
  description:
    'A panel of common allergens is applied to the forearm and read after twenty minutes, ' +
    'with results explained the same visit.',
  category: 'DIAGNOSTICS' as const,
  durationMinutes: '45',
  preparation: 'Stop antihistamines three days before the test.',
  sortOrder: '4',
  isActive: true,
  ...overrides,
});

describe('listServicesByCategory', () => {
  it('groups services in the fixed schema order, not alphabetically', async () => {
    await createService({ name: 'Dental Check', slug: 'dental', category: 'DENTAL' });
    await createService({ name: 'Consultation', slug: 'consult', category: 'CONSULTATION' });

    const groups = await service.listServicesByCategory();

    expect(groups.map((group) => group.category)).toEqual(['CONSULTATION', 'DENTAL']);
  });

  it('omits categories that have no active services', async () => {
    await createService({ category: 'CONSULTATION' });
    await createService({ category: 'DENTAL', isActive: false });

    const groups = await service.listServicesByCategory();

    expect(groups.map((group) => group.category)).toEqual(['CONSULTATION']);
  });
});

describe('getServiceBySlug', () => {
  it('returns the doctors who perform the service', async () => {
    const clinicService = await createService({ slug: 'ecg' });
    const doctor = await createDoctor();
    await prisma.doctorService.create({
      data: { doctorId: doctor.id, serviceId: clinicService.id },
    });

    const found = await service.getServiceBySlug('ecg');

    expect(found.doctors).toHaveLength(1);
    expect(found.doctors[0]?.doctor.specialty).toBeTruthy();
  });

  it('omits doctors who no longer practise here', async () => {
    const clinicService = await createService({ slug: 'xray' });
    const doctor = await createDoctor({ isActive: false });
    await prisma.doctorService.create({
      data: { doctorId: doctor.id, serviceId: clinicService.id },
    });

    const found = await service.getServiceBySlug('xray');

    expect(found.doctors).toHaveLength(0);
  });

  it('throws NOT_FOUND for a withdrawn service on the public site', async () => {
    await createService({ slug: 'withdrawn', isActive: false });

    await expect(service.getServiceBySlug('withdrawn')).rejects.toThrow(/could not be found/i);
  });
});

describe('createService', () => {
  it('coerces the string values a form submits', async () => {
    const created = await service.createService(validForm());

    expect(created.durationMinutes).toBe(45);
    expect(created.sortOrder).toBe(4);
  });

  it('treats a blank duration as "not specified" rather than zero', async () => {
    const created = await service.createService(validForm({ durationMinutes: '' }));

    expect(created.durationMinutes).toBeNull();
  });

  it('refuses a slug already in use', async () => {
    await createService({ slug: 'allergy-testing' });

    await expect(service.createService(validForm())).rejects.toThrow(/already in use/i);
  });

  it('rejects a summary too short to be useful in a list', async () => {
    await expect(service.createService(validForm({ summary: 'Tests.' }))).rejects.toThrow();
  });
});

describe('updateService', () => {
  it('lets a service keep its own slug', async () => {
    const existing = await createService({ slug: 'allergy-testing' });

    const updated = await service.updateService({ ...validForm(), id: existing.id });

    expect(updated.slug).toBe('allergy-testing');
  });

  it('throws NOT_FOUND for an unknown id', async () => {
    await expect(service.updateService({ ...validForm(), id: 'missing' })).rejects.toThrow(
      /could not be found/i,
    );
  });
});

describe('setServiceActive', () => {
  it('withdraws a service without deleting the row', async () => {
    const existing = await createService();

    await service.setServiceActive({ id: existing.id, isActive: false });

    const stillThere = await prisma.service.findUnique({ where: { id: existing.id } });
    expect(stillThere?.isActive).toBe(false);
  });

  it('reads the string "false" from a form as false, not as a truthy string', async () => {
    const existing = await createService();

    await service.setServiceActive({ id: existing.id, isActive: 'false' });

    const stillThere = await prisma.service.findUnique({ where: { id: existing.id } });
    expect(stillThere?.isActive).toBe(false);
  });
});
