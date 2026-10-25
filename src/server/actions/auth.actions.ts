'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { signInSchema } from '@/lib/schemas/auth';
import type { ActionResult } from '@/lib/schemas';

/**
 * Signs a staff member in and returns where to go next.
 *
 * The failure message never distinguishes an unknown email from a wrong
 * password — that difference is how an attacker enumerates staff accounts.
 */
export async function signInStaff(input: {
  email: string;
  password: string;
  next?: string;
}): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Please enter your email address and password.' };
  }

  // Only same-site admin paths are accepted, so `?next=` cannot be used to
  // bounce a signed-in staff member to an external site.
  const redirectTo =
    input.next && /^\/admin(?!\/login)(\/|$)/.test(input.next) ? input.next : '/admin/appointments';

  try {
    await signIn('credentials', { ...parsed.data, redirect: false });
    return { ok: true, data: { redirectTo } };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: 'Those details do not match an account.' };
    }
    throw error;
  }
}
