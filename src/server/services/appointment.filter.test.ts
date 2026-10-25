import { describe, expect, it } from 'vitest';
import { appointmentPayload } from '@/tests/factories';
import * as service from './appointment.service';

/**
 * The admin inbox reads `?page=` and `?status=` straight from the URL, so the
 * filter has to survive anything a person can type into the address bar.
 * A non-integer page used to reach `z.int()` and throw a raw ZodError, which
 * surfaced as a 500 on /admin/appointments?page=1.5.
 */
describe('listAppointments with hostile query values', () => {
  it('falls back to page 1 for a non-integer page', async () => {
    await service.submitAppointmentRequest(appointmentPayload());

    const result = await service.listAppointments({ page: 1.5 as unknown as number });

    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('falls back to page 1 for junk, zero and negative pages', async () => {
    for (const page of ['abc', 0, -3, Number.NaN, Infinity]) {
      const result = await service.listAppointments({ page: page as unknown as number });
      expect(result.page).toBe(1);
    }
  });

  it('ignores an unknown status rather than throwing', async () => {
    await service.submitAppointmentRequest(appointmentPayload());

    const result = await service.listAppointments({
      status: 'BOGUS' as never,
      page: 1,
    });

    expect(result.items).toHaveLength(1);
  });
});

/**
 * The duplicate guard exists so one patient tapping Send twice does not become
 * two rows staff reconcile by hand. Comparing the phone as typed missed the
 * case where the two submissions were spaced differently.
 */
describe('duplicate detection across phone formatting', () => {
  it('treats differently spaced forms of one number as the same patient', async () => {
    await service.submitAppointmentRequest(appointmentPayload({ phone: '+91 98450 00000' }));

    await expect(
      service.submitAppointmentRequest(appointmentPayload({ phone: '+919845000000' })),
    ).rejects.toThrow(/already have your request/i);
  });

  it('still lets a genuinely different number through', async () => {
    await service.submitAppointmentRequest(appointmentPayload({ phone: '+91 98450 00000' }));

    await expect(
      service.submitAppointmentRequest(appointmentPayload({ phone: '+91 98450 11111' })),
    ).resolves.toBeTruthy();
  });
});
