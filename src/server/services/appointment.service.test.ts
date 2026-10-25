import { describe, expect, it, vi } from 'vitest';
import { appointmentPayload, createDoctor, createService } from '@/tests/factories';
import { AppError } from '@/lib/errors';
import * as service from './appointment.service';

describe('submitAppointmentRequest', () => {
  it('stores a request with status NEW', async () => {
    const created = await service.submitAppointmentRequest(appointmentPayload());

    expect(created.status).toBe('NEW');
    expect(created.patientName).toBe('Asha Patel');
  });

  it('stores the preferred date as a calendar date, not shifted by timezone', async () => {
    const created = await service.submitAppointmentRequest(
      appointmentPayload({ preferredDate: nextWeekIso() }),
    );

    expect(created.preferredDate.toISOString().slice(0, 10)).toBe(nextWeekIso());
  });

  it('links the chosen doctor and service', async () => {
    const doctor = await createDoctor();
    const clinicService = await createService();

    const created = await service.submitAppointmentRequest(
      appointmentPayload({ doctorId: doctor.id, serviceId: clinicService.id }),
    );

    expect(created.doctorId).toBe(doctor.id);
    expect(created.serviceId).toBe(clinicService.id);
  });

  it('accepts a request with no doctor or service preference', async () => {
    const created = await service.submitAppointmentRequest(
      appointmentPayload({ doctorId: '', serviceId: '' }),
    );

    expect(created.doctorId).toBeNull();
    expect(created.serviceId).toBeNull();
  });

  it('rejects a date in the past', async () => {
    await expect(
      service.submitAppointmentRequest(appointmentPayload({ preferredDate: '2020-01-01' })),
    ).rejects.toThrow(AppError);
  });

  it('rejects a reason that is too short to act on', async () => {
    await expect(
      service.submitAppointmentRequest(appointmentPayload({ reason: 'pain' })),
    ).rejects.toThrow(/why you would like to be seen/i);
  });

  it('rejects a doctor id that does not exist', async () => {
    await expect(
      service.submitAppointmentRequest(appointmentPayload({ doctorId: 'nope' })),
    ).rejects.toThrow(/doctor/i);
  });

  it('rejects a doctor who is no longer practising here', async () => {
    const doctor = await createDoctor({ isActive: false });

    await expect(
      service.submitAppointmentRequest(appointmentPayload({ doctorId: doctor.id })),
    ).rejects.toThrow(/doctor/i);
  });

  it('refuses a second identical request from the same phone within the window', async () => {
    await service.submitAppointmentRequest(appointmentPayload());

    await expect(service.submitAppointmentRequest(appointmentPayload())).rejects.toThrow(
      /already have your request/i,
    );
  });

  it('allows the same phone number again once the window has passed', async () => {
    await service.submitAppointmentRequest(appointmentPayload());

    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 1000 * 60 * 60 * 3));
    try {
      await expect(service.submitAppointmentRequest(appointmentPayload())).resolves.toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('never writes the patient reason into an error message', async () => {
    const secret = 'Confidential: suspected tuberculosis, please do not share this text.';

    try {
      await service.submitAppointmentRequest(
        appointmentPayload({ reason: secret, preferredDate: '2020-01-01' }),
      );
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as Error).message).not.toContain('tuberculosis');
    }
  });
});

describe('listAppointments', () => {
  it('returns the newest request first', async () => {
    await service.submitAppointmentRequest(appointmentPayload({ patientName: 'First Patient' }));
    await service.submitAppointmentRequest(
      appointmentPayload({ patientName: 'Second Patient', phone: '+91 98450 11111' }),
    );

    const { items } = await service.listAppointments({ page: 1 });

    expect(items[0]?.patientName).toBe('Second Patient');
  });

  it('filters by status', async () => {
    const created = await service.submitAppointmentRequest(appointmentPayload());
    await service.changeAppointmentStatus({ id: created.id, status: 'CONFIRMED' });

    const confirmed = await service.listAppointments({ page: 1, status: 'CONFIRMED' });
    const fresh = await service.listAppointments({ page: 1, status: 'NEW' });

    expect(confirmed.items).toHaveLength(1);
    expect(fresh.items).toHaveLength(0);
  });

  it('reports counts for every status, including empty ones', async () => {
    await service.submitAppointmentRequest(appointmentPayload());

    const { counts } = await service.listAppointments({ page: 1 });

    expect(counts.NEW).toBe(1);
    expect(counts.CANCELLED).toBe(0);
  });

  it('paginates', async () => {
    for (let index = 0; index < 3; index += 1) {
      await service.submitAppointmentRequest(
        appointmentPayload({ phone: `+91 98450 0000${index}` }),
      );
    }

    const page = await service.listAppointments({ page: 1 });

    expect(page.total).toBe(3);
    expect(page.totalPages).toBe(1);
  });
});

describe('changeAppointmentStatus', () => {
  it('updates the status and the staff note', async () => {
    const created = await service.submitAppointmentRequest(appointmentPayload());

    const updated = await service.changeAppointmentStatus({
      id: created.id,
      status: 'CONTACTED',
      staffNote: 'Called, offered Thursday 10am.',
    });

    expect(updated.status).toBe('CONTACTED');
    expect(updated.staffNote).toBe('Called, offered Thursday 10am.');
  });

  it('keeps an existing note when none is supplied', async () => {
    const created = await service.submitAppointmentRequest(appointmentPayload());
    await service.changeAppointmentStatus({
      id: created.id,
      status: 'CONTACTED',
      staffNote: 'Left a voicemail.',
    });

    const updated = await service.changeAppointmentStatus({
      id: created.id,
      status: 'CONFIRMED',
    });

    expect(updated.staffNote).toBe('Left a voicemail.');
  });

  it('throws NOT_FOUND for an unknown id', async () => {
    await expect(
      service.changeAppointmentStatus({ id: 'missing', status: 'CONFIRMED' }),
    ).rejects.toThrow(/could not be found/i);
  });

  it('refuses to reopen a cancelled request', async () => {
    const created = await service.submitAppointmentRequest(appointmentPayload());
    await service.changeAppointmentStatus({ id: created.id, status: 'CANCELLED' });

    await expect(
      service.changeAppointmentStatus({ id: created.id, status: 'NEW' }),
    ).rejects.toThrow(/cancelled/i);
  });
});

const nextWeekIso = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};
