import { z } from 'zod';

export const cuidSchema = z.string().min(1).max(40);

/** Empty strings from HTML inputs become `undefined` rather than failing. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? undefined : value))
    .optional();

export const optionalId = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .optional();

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only');

export const sortOrderSchema = z.coerce.number().int().min(0).max(999).default(0);

/** A result type for server actions — never throws across the boundary. */
export type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * HTML forms submit booleans as the strings "on"/"true"/"false", and
 * `z.coerce.boolean()` would read "false" as `true` because any non-empty
 * string is truthy. This reads the intent instead.
 */
export const formBoolean = (defaultValue: boolean) =>
  z
    .union([z.boolean(), z.string()])
    .default(defaultValue)
    .transform((value) => {
      if (typeof value === 'boolean') return value;
      return ['true', 'on', '1', 'yes'].includes(value.toLowerCase());
    });

/**
 * An image path served from /public, e.g. "/doctors/ananya-rao.jpg".
 *
 * next/image refuses any host not listed in `images.remotePatterns`, and it
 * refuses by throwing — a remote URL typed into the admin form took down the
 * doctor pages with a 500 rather than showing a broken image. Rejecting it at
 * the form boundary turns that into a field error the author can act on.
 */
export const isLocalImagePath = (value: string): boolean =>
  value.startsWith('/') && !value.startsWith('//');

export const localImagePath = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value === '' ? undefined : value))
  .optional()
  .refine(
    (value) => value === undefined || isLocalImagePath(value),
    'Use a path to a file in /public, starting with a slash — for example /doctors/name.jpg',
  );
