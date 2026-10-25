'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, inputClass } from '@/components/ui/Field';
import { ErrorNotice, SuccessNotice } from '@/components/ui/States';
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  serviceFormSchema,
  type ServiceFormInput,
  type ServiceFormParsed,
} from '@/lib/schemas';
import { saveService } from '@/server/actions/content.actions';

export type ServiceEditorValues = ServiceFormInput & { id?: string };

export function ServiceEditor({
  initial,
  onClose,
}: {
  initial?: ServiceEditorValues;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput, unknown, ServiceFormParsed>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      summary: initial?.summary ?? '',
      description: initial?.description ?? '',
      category: initial?.category ?? 'CONSULTATION',
      durationMinutes: initial?.durationMinutes ?? '',
      preparation: initial?.preparation ?? '',
      sortOrder: initial?.sortOrder ?? 0,
      isActive: initial?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSaved(false);

    const result = await saveService({ ...values, id: initial?.id });

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
        <h2 className="text-xl">{initial?.id ? `Edit ${initial.name}` : 'Add a service'}</h2>
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
          <Field label="Service name" error={errors.name?.message} required>
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
            hint="Appears as /services/your-slug"
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

          <Field label="Category" error={errors.category?.message} required>
            {(props) => (
              <select
                className={inputClass(Boolean(errors.category))}
                {...props}
                {...register('category')}
              >
                {SERVICE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {SERVICE_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field
            label="Typical length in minutes"
            hint="Leave blank if it varies"
            error={errors.durationMinutes?.message}
          >
            {(props) => (
              <input
                type="number"
                min={5}
                max={480}
                className={inputClass(Boolean(errors.durationMinutes))}
                {...props}
                {...register('durationMinutes')}
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

        <Field
          label="Summary"
          hint="One sentence, shown in the services list"
          error={errors.summary?.message}
          required
        >
          {(props) => (
            <textarea
              rows={2}
              className={inputClass(Boolean(errors.summary))}
              {...props}
              {...register('summary')}
            />
          )}
        </Field>

        <Field label="Full description" error={errors.description?.message} required>
          {(props) => (
            <textarea
              rows={5}
              className={inputClass(Boolean(errors.description))}
              {...props}
              {...register('description')}
            />
          )}
        </Field>

        <Field
          label="How to prepare"
          hint="Fasting, what to bring, who to come with"
          error={errors.preparation?.message}
        >
          {(props) => (
            <textarea
              rows={3}
              className={inputClass(Boolean(errors.preparation))}
              {...props}
              {...register('preparation')}
            />
          )}
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-accent-600 size-4" {...register('isActive')} />
          Offer this service on the public website
        </label>

        <div className="border-border flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save service'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
