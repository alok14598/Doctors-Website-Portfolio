'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, inputClass } from '@/components/ui/Field';
import { ErrorNotice, SuccessNotice } from '@/components/ui/States';
import { doctorFormSchema, type DoctorFormInput, type DoctorFormParsed } from '@/lib/schemas';
import { shortDayName } from '@/lib/format';
import { saveDoctor } from '@/server/actions/content.actions';

type Option = { id: string; name: string };

export type DoctorEditorValues = DoctorFormInput & { id?: string; serviceIds: string[] };

const DAYS = [1, 2, 3, 4, 5, 6, 0];

export function DoctorEditor({
  specialties,
  services,
  initial,
  onClose,
}: {
  specialties: Option[];
  services: Option[];
  initial?: DoctorEditorValues;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [serviceIds, setServiceIds] = useState<string[]>(initial?.serviceIds ?? []);
  const [consultingDays, setConsultingDays] = useState<number[]>(
    (initial?.consultingDays as number[]) ?? [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // The schema transforms its input (comma lists become arrays), so the
    // submitted values are the parsed output type, not the field type.
  } = useForm<DoctorFormInput, unknown, DoctorFormParsed>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      designation: initial?.designation ?? '',
      specialtyId: initial?.specialtyId ?? specialties[0]?.id ?? '',
      qualifications: initial?.qualifications ?? '',
      bio: initial?.bio ?? '',
      photoUrl: initial?.photoUrl ?? '',
      experienceYears: initial?.experienceYears ?? 0,
      languages: initial?.languages ?? '',
      registrationNo: initial?.registrationNo ?? '',
      consultingHours: initial?.consultingHours ?? '',
      sortOrder: initial?.sortOrder ?? 0,
      isActive: initial?.isActive ?? true,
    },
  });

  const toggleDay = (day: number) =>
    setConsultingDays((days) =>
      days.includes(day) ? days.filter((value) => value !== day) : [...days, day],
    );

  const toggleService = (id: string) =>
    setServiceIds((ids) => (ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]));

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSaved(false);

    const result = await saveDoctor({ ...values, consultingDays, id: initial?.id }, serviceIds);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setIsSaved(true);
    router.refresh();
  });

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl">{initial?.id ? `Edit ${initial.name}` : 'Add a doctor'}</h2>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        {submitError ? <ErrorNotice>{submitError}</ErrorNotice> : null}
        {isSaved ? (
          <SuccessNotice>Saved. The public pages have been refreshed.</SuccessNotice>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.name?.message} required>
            {(props) => (
              <input
                type="text"
                className={inputClass(Boolean(errors.name))}
                {...props}
                {...register('name')}
              />
            )}
          </Field>

          <Field
            label="Web address"
            hint="Appears as /doctors/your-slug"
            error={errors.slug?.message}
            required
          >
            {(props) => (
              <input
                type="text"
                className={inputClass(Boolean(errors.slug))}
                {...props}
                {...register('slug')}
              />
            )}
          </Field>

          <Field label="Designation" error={errors.designation?.message} required>
            {(props) => (
              <input
                type="text"
                placeholder="Consultant Paediatrician"
                className={inputClass(Boolean(errors.designation))}
                {...props}
                {...register('designation')}
              />
            )}
          </Field>

          <Field label="Specialty" error={errors.specialtyId?.message} required>
            {(props) => (
              <select
                className={inputClass(Boolean(errors.specialtyId))}
                {...props}
                {...register('specialtyId')}
              >
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field
            label="Qualifications"
            hint="Separate with commas"
            error={errors.qualifications?.message}
            required
          >
            {(props) => (
              <input
                type="text"
                placeholder="MBBS, MD (Paediatrics)"
                className={inputClass(Boolean(errors.qualifications))}
                {...props}
                {...register('qualifications')}
              />
            )}
          </Field>

          <Field label="Languages" hint="Separate with commas" error={errors.languages?.message}>
            {(props) => (
              <input
                type="text"
                placeholder="English, Kannada"
                className={inputClass(Boolean(errors.languages))}
                {...props}
                {...register('languages')}
              />
            )}
          </Field>

          <Field label="Years of experience" error={errors.experienceYears?.message} required>
            {(props) => (
              <input
                type="number"
                min={0}
                max={70}
                className={inputClass(Boolean(errors.experienceYears))}
                {...props}
                {...register('experienceYears')}
              />
            )}
          </Field>

          <Field label="Registration number" error={errors.registrationNo?.message}>
            {(props) => (
              <input
                type="text"
                className={inputClass(Boolean(errors.registrationNo))}
                {...props}
                {...register('registrationNo')}
              />
            )}
          </Field>

          <Field label="Consulting hours" error={errors.consultingHours?.message}>
            {(props) => (
              <input
                type="text"
                placeholder="9:00 am – 1:00 pm"
                className={inputClass(Boolean(errors.consultingHours))}
                {...props}
                {...register('consultingHours')}
              />
            )}
          </Field>

          <Field
            label="Photo URL"
            hint="Leave blank to show initials"
            error={errors.photoUrl?.message}
          >
            {(props) => (
              <input
                type="text"
                placeholder="/doctors/name.jpg"
                className={inputClass(Boolean(errors.photoUrl))}
                {...props}
                {...register('photoUrl')}
              />
            )}
          </Field>

          <Field label="Display order" error={errors.sortOrder?.message}>
            {(props) => (
              <input
                type="number"
                min={0}
                className={inputClass(Boolean(errors.sortOrder))}
                {...props}
                {...register('sortOrder')}
              />
            )}
          </Field>
        </div>

        <Field label="Biography" error={errors.bio?.message} required>
          {(props) => (
            <textarea
              rows={5}
              className={inputClass(Boolean(errors.bio))}
              {...props}
              {...register('bio')}
            />
          )}
        </Field>

        <fieldset>
          <legend className="text-ink-900 text-sm font-medium">Consulting days</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <label
                key={day}
                className="border-border-strong rounded-field has-checked:border-accent-600 has-checked:bg-accent-50 has-checked:text-accent-700 flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={consultingDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="accent-accent-600 size-4"
                />
                {shortDayName(day)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-ink-900 text-sm font-medium">Services provided</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {services.map((service) => (
              <label key={service.id} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={serviceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="accent-accent-600 mt-0.5 size-4"
                />
                {service.name}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-accent-600 size-4" {...register('isActive')} />
          Show on the public website
        </label>

        <div className="border-border flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save doctor'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
