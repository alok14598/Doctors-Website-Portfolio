'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { ErrorNotice } from '@/components/ui/States';
import {
  appointmentRequestSchema,
  MAX_DAYS_AHEAD,
  PREFERRED_SLOTS,
  SLOT_LABELS,
  type AppointmentRequestInput,
} from '@/lib/schemas';
import { toDateInputValue } from '@/lib/format';
import { requestAppointment } from '@/server/actions/appointment.actions';

type Option = { id: string; name: string };

const today = new Date();
const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

export function AppointmentForm({
  doctors,
  services,
  defaultDoctorId,
}: {
  doctors: Option[];
  services: Option[];
  defaultDoctorId?: string;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedName, setConfirmedName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentRequestInput>({
    // The same schema the Server Action re-validates with, so the two can never
    // disagree about what a valid request looks like.
    resolver: zodResolver(appointmentRequestSchema),
    defaultValues: {
      patientName: '',
      phone: '',
      email: '',
      preferredDate: '',
      preferredSlot: 'MORNING',
      doctorId: defaultDoctorId ?? '',
      serviceId: '',
      reason: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const result = await requestAppointment(values);

    if (result.ok) {
      setConfirmedName(result.data.patientName);
      return;
    }

    // Field errors from the server land on the matching inputs; anything else
    // is shown once at the top of the form.
    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof AppointmentRequestInput, { message: messages[0] });
        }
      }
    }

    setSubmitError(result.error);
  });

  if (confirmedName) {
    return (
      <div
        role="status"
        className="rounded-card border-success-600/25 bg-success-50 border p-6 sm:p-8"
      >
        <h2 className="text-success-600 text-2xl">Request received</h2>
        <p className="text-ink-700 mt-4 text-sm leading-relaxed">
          Thank you, {confirmedName}. Reception will call you back on the number you gave to agree a
          time, usually within one working day.
        </p>
        <p className="text-ink-700 mt-4 text-sm leading-relaxed">
          <strong className="font-semibold">This is not a confirmed booking yet.</strong> Your slot
          is reserved only once we have spoken to you. If your concern is urgent, please telephone
          the clinic rather than waiting for our call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {submitError ? <ErrorNotice>{submitError}</ErrorNotice> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your full name" error={errors.patientName?.message} required>
          {(fieldProps) => (
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. Asha Patel"
              className={inputClass(Boolean(errors.patientName))}
              {...fieldProps}
              {...register('patientName')}
            />
          )}
        </Field>

        <Field
          label="Phone number"
          error={errors.phone?.message}
          hint="We call this number to confirm your appointment."
          required
        >
          {(fieldProps) => (
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+91 98450 00000"
              className={inputClass(Boolean(errors.phone))}
              {...fieldProps}
              {...register('phone')}
            />
          )}
        </Field>
      </div>

      <Field label="Email address" error={errors.email?.message}>
        {(fieldProps) => (
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass(Boolean(errors.email))}
            {...fieldProps}
            {...register('email')}
          />
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Preferred date" error={errors.preferredDate?.message} required>
          {(fieldProps) => (
            <input
              type="date"
              min={toDateInputValue(today)}
              max={toDateInputValue(maxDate)}
              className={inputClass(Boolean(errors.preferredDate))}
              {...fieldProps}
              {...register('preferredDate')}
            />
          )}
        </Field>

        <Field label="Preferred time of day" error={errors.preferredSlot?.message} required>
          {(fieldProps) => (
            <select
              className={inputClass(Boolean(errors.preferredSlot))}
              {...fieldProps}
              {...register('preferredSlot')}
            >
              {PREFERRED_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {SLOT_LABELS[slot]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Doctor you would like to see" error={errors.doctorId?.message}>
          {(fieldProps) => (
            <select
              className={inputClass(Boolean(errors.doctorId))}
              {...fieldProps}
              {...register('doctorId')}
            >
              <option value="">No preference</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Service" error={errors.serviceId?.message}>
          {(fieldProps) => (
            <select
              className={inputClass(Boolean(errors.serviceId))}
              {...fieldProps}
              {...register('serviceId')}
            >
              <option value="">Not sure / general consultation</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field
        label="Why would you like to be seen?"
        error={errors.reason?.message}
        hint="A sentence or two is enough. This is shared only with clinic staff."
        required
      >
        {(fieldProps) => (
          <textarea
            rows={4}
            placeholder="e.g. Persistent cough for two weeks, worse at night."
            className={inputClass(Boolean(errors.reason))}
            {...fieldProps}
            {...register('reason')}
          />
        )}
      </Field>

      <div className="border-border flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-400 max-w-md text-xs leading-relaxed">
          Submitting this form sends a request, not a booking. Reception confirms every appointment
          by telephone.
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send request'}
        </Button>
      </div>
    </form>
  );
}
