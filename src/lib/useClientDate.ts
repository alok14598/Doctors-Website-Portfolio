'use client';

import { useSyncExternalStore } from 'react';

/**
 * The current date is external state — it lives outside React and changes
 * without React being told — so it is read with `useSyncExternalStore` rather
 * than mirrored into state from an effect.
 *
 * Why this matters at all: public pages are statically generated, so a plain
 * `new Date()` on the server is the *build* date and stays frozen until the
 * next deploy. The opening-hours table highlighted whichever weekday the site
 * happened to be built on, for every visitor, until someone redeployed.
 *
 * The date never changes while a page is open, so there is nothing to
 * subscribe to and the unsubscribe is a no-op.
 */
const neverChanges = () => () => {};

/** Day of the week in the visitor's timezone; `null` on the server. */
export const useClientDayOfWeek = (): number | null =>
  useSyncExternalStore(
    neverChanges,
    () => new Date().getDay(),
    () => null,
  );

/**
 * The build year is the server snapshot, so the markup is never empty and the
 * value is only ever wrong between New Year and the next deploy.
 */
const buildYear = new Date().getFullYear();

export const useClientYear = (): number =>
  useSyncExternalStore(
    neverChanges,
    () => new Date().getFullYear(),
    () => buildYear,
  );
