type ClassValue = string | number | null | undefined | false;

/**
 * Minimal class joiner. Deliberately not `tailwind-merge`: these components
 * expose a narrow set of variants rather than accepting arbitrary overrides,
 * so there are no conflicting utilities to resolve.
 */
export const cn = (...values: ClassValue[]): string =>
  values.filter((value): value is string | number => Boolean(value)).join(' ');
