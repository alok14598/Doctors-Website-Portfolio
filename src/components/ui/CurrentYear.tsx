'use client';

import { useClientYear } from '@/lib/useClientDate';

/**
 * The copyright year, resolved in the browser. On a statically generated page
 * a server-rendered year is the build year, which would be wrong every January
 * until the next deploy.
 */
export function CurrentYear() {
  return <>{useClientYear()}</>;
}
