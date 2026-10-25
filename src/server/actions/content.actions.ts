'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { toUserMessage } from '@/lib/errors';
import type { ActionResult, DoctorFormInput, ServiceFormInput } from '@/lib/schemas';
import {
  createDoctor,
  getDoctorSlugById,
  setDoctorActive,
  updateDoctor,
} from '@/server/services/doctor.service';
import {
  createService,
  getServiceSlugById,
  setServiceActive,
  updateService,
} from '@/server/services/service.service';

/**
 * Public pages that must be refreshed after a doctor changes.
 *
 * Both the new and the previous slug are revalidated: renaming a doctor leaves
 * the old URL cached, so it would keep serving the pre-rename page instead of
 * the 404 it has become.
 */
const revalidateDoctorPages = (...slugs: (string | null | undefined)[]): void => {
  revalidatePath('/');
  revalidatePath('/doctors');
  revalidatePath('/services');
  revalidatePath('/appointment');
  revalidatePath('/admin/doctors');
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/doctors/${slug}`);
  }
};

const revalidateServicePages = (...slugs: (string | null | undefined)[]): void => {
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/doctors');
  revalidatePath('/appointment');
  revalidatePath('/admin/services');
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/services/${slug}`);
  }
};

export async function saveDoctor(
  input: DoctorFormInput & { id?: string },
  serviceIds: string[],
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireStaff();

    // Read the slug before the update so a rename can clear the old URL too.
    const previousSlug = input.id ? await getDoctorSlugById(input.id) : null;

    const doctor = input.id
      ? await updateDoctor({ ...input, id: input.id }, serviceIds)
      : await createDoctor(input, serviceIds);

    revalidateDoctorPages(doctor.slug, previousSlug);

    return { ok: true, data: { slug: doctor.slug } };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}

export async function toggleDoctorActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireStaff();

    const doctor = await setDoctorActive({ id, isActive });
    revalidateDoctorPages(doctor.slug);

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}

export async function saveService(
  input: ServiceFormInput & { id?: string },
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireStaff();

    const previousSlug = input.id ? await getServiceSlugById(input.id) : null;

    const service = input.id
      ? await updateService({ ...input, id: input.id })
      : await createService(input);

    revalidateServicePages(service.slug, previousSlug);

    return { ok: true, data: { slug: service.slug } };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireStaff();

    const service = await setServiceActive({ id, isActive });
    revalidateServicePages(service.slug);

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}
