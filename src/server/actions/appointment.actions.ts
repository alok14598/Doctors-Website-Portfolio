'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/rateLimit';
import { toUserMessage } from '@/lib/errors';
import {
  appointmentRequestSchema,
  updateAppointmentStatusSchema,
  type ActionResult,
  type AppointmentRequestInput,
  type UpdateAppointmentStatusInput,
} from '@/lib/schemas';
import { requireStaff } from '@/lib/auth';
import {
  changeAppointmentStatus,
  submitAppointmentRequest,
} from '@/server/services/appointment.service';

const RATE_LIMIT = { limit: 5, windowMs: 1000 * 60 * 15 };

/**
 * Best-effort client identity for rate limiting. Proxy headers are spoofable,
 * so this raises the cost of abuse rather than preventing it; the duplicate
 * check in the service layer is the backstop that protects the staff inbox.
 */
const clientKey = async (): Promise<string> => {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');

  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
};

/**
 * Public action behind the patient-facing form.
 *
 * Returns a result rather than throwing: a thrown error in a Server Action
 * reaches the browser as an opaque digest, and the patient needs to be told
 * what to fix. Nothing from the submitted payload is echoed into the message —
 * `reason` is health information.
 */
export async function requestAppointment(
  input: AppointmentRequestInput,
): Promise<ActionResult<{ patientName: string }>> {
  const parsed = appointmentRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const limit = checkRateLimit(`appointment:${await clientKey()}`, RATE_LIMIT);
  if (!limit.allowed) {
    return {
      ok: false,
      error:
        'We have received several requests from this device recently. Please telephone the clinic instead.',
    };
  }

  try {
    const created = await submitAppointmentRequest(parsed.data);
    revalidatePath('/admin/appointments');

    return { ok: true, data: { patientName: created.patientName } };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}

/** Staff-only. Advances a request through the workflow. */
export async function updateAppointmentStatus(
  input: UpdateAppointmentStatusInput,
): Promise<ActionResult> {
  try {
    await requireStaff();

    const parsed = updateAppointmentStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: 'Please choose a valid status.' };
    }

    await changeAppointmentStatus(parsed.data);
    revalidatePath('/admin/appointments');

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}
