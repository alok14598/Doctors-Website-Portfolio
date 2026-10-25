import type { AppointmentRequest, AppointmentStatus } from '@prisma/client';
import { AppError } from '@/lib/errors';
import { normalisePhone } from '@/lib/format';
import {
  appointmentFilterSchema,
  appointmentRequestSchema,
  updateAppointmentStatusSchema,
  type AppointmentRequestInput,
  type UpdateAppointmentStatusInput,
} from '@/lib/schemas';
import * as repo from '../repositories/appointment.repository';
import * as doctorRepo from '../repositories/doctor.repository';
import * as serviceRepo from '../repositories/service.repository';

export const APPOINTMENTS_PER_PAGE = 20;

/**
 * A second request from the same phone inside this window is treated as a
 * double submission. Staff would otherwise have to reconcile two rows for one
 * patient, which is worse than making the patient wait.
 */
const DUPLICATE_WINDOW_MS = 1000 * 60 * 60 * 2;

/** `@db.Date` columns ignore the time, but the Date must be built in UTC to
 * avoid a local-timezone offset rolling the calendar day backwards. */
const toCalendarDate = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

/**
 * Validates and stores a patient's appointment request.
 *
 * Validation errors are surfaced as `AppError` with the schema's own message —
 * never with the submitted value interpolated into it, because `reason` is
 * health information.
 */
export const submitAppointmentRequest = async (
  input: AppointmentRequestInput,
): Promise<AppointmentRequest> => {
  const parsed = appointmentRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw AppError.validation(parsed.error.issues[0]?.message ?? 'Please check the form.');
  }

  const data = parsed.data;

  if (data.doctorId) {
    const doctor = await doctorRepo.findById(data.doctorId);
    if (!doctor || !doctor.isActive) {
      throw AppError.validation('That doctor is not available for appointments.');
    }
  }

  if (data.serviceId) {
    const service = await serviceRepo.findById(data.serviceId);
    if (!service || !service.isActive) {
      throw AppError.validation('That service is not currently offered.');
    }
  }

  const recent = await repo.countRecentByPhone(
    normalisePhone(data.phone),
    new Date(Date.now() - DUPLICATE_WINDOW_MS),
  );
  if (recent > 0) {
    throw new AppError(
      'CONFLICT',
      'We already have your request from the last couple of hours and will call you back shortly. Please telephone the clinic if it is urgent.',
    );
  }

  return repo.create({
    patientName: data.patientName,
    phone: data.phone,
    email: data.email,
    preferredDate: toCalendarDate(data.preferredDate),
    preferredSlot: data.preferredSlot,
    reason: data.reason,
    ...(data.doctorId ? { doctor: { connect: { id: data.doctorId } } } : {}),
    ...(data.serviceId ? { service: { connect: { id: data.serviceId } } } : {}),
  });
};

export const listAppointments = async (input: {
  status?: AppointmentStatus;
  page?: number;
}): Promise<{
  items: repo.AppointmentWithRefs[];
  total: number;
  page: number;
  totalPages: number;
  counts: Record<AppointmentStatus, number>;
}> => {
  const filter = appointmentFilterSchema.parse(input);

  const [{ rows, total }, counts] = await Promise.all([
    repo.findPage({ status: filter.status, page: filter.page, limit: APPOINTMENTS_PER_PAGE }),
    repo.countByStatus(),
  ]);

  return {
    items: rows,
    total,
    page: filter.page,
    totalPages: Math.max(1, Math.ceil(total / APPOINTMENTS_PER_PAGE)),
    counts,
  };
};

/**
 * Advances a request through the workflow. A cancelled request is terminal —
 * reopening one would hide from staff that it was ever cancelled, so they must
 * ask the patient to submit again.
 */
export const changeAppointmentStatus = async (
  input: UpdateAppointmentStatusInput,
): Promise<AppointmentRequest> => {
  const parsed = updateAppointmentStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw AppError.validation(parsed.error.issues[0]?.message ?? 'Please check the form.');
  }

  const { id, status, staffNote } = parsed.data;

  const existing = await repo.findById(id);
  if (!existing) throw AppError.notFound('That appointment request');

  if (existing.status === 'CANCELLED' && status !== 'CANCELLED') {
    throw new AppError(
      'CONFLICT',
      'This request was cancelled and cannot be reopened. Ask the patient to submit a new request.',
    );
  }

  return repo.update(id, {
    status,
    // An omitted note leaves the existing one alone rather than clearing it.
    ...(staffNote === undefined ? {} : { staffNote }),
  });
};
