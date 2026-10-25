'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { ErrorNotice } from '@/components/ui/States';
import { signInSchema, type SignInInput } from '@/lib/schemas/auth';
import { signInStaff } from '@/server/actions/auth.actions';

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const result = await signInStaff({ ...values, next });

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    router.replace(result.data.redirectTo);
    // The admin layout reads the session on the server, so the new cookie only
    // takes effect after a refresh of the server tree.
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {submitError ? <ErrorNotice>{submitError}</ErrorNotice> : null}

      <Field label="Email address" error={errors.email?.message} required>
        {(fieldProps) => (
          <input
            type="email"
            autoComplete="username"
            className={inputClass(Boolean(errors.email))}
            {...fieldProps}
            {...register('email')}
          />
        )}
      </Field>

      <Field label="Password" error={errors.password?.message} required>
        {(fieldProps) => (
          <input
            type="password"
            autoComplete="current-password"
            className={inputClass(Boolean(errors.password))}
            {...fieldProps}
            {...register('password')}
          />
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
