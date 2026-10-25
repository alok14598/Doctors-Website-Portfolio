import type { ClinicProfile, OpeningHour } from '@prisma/client';
import { prisma } from '../db';

/** The profile is a singleton row; there is never more than one. */
export const findProfile = (): Promise<ClinicProfile | null> => prisma.clinicProfile.findFirst();

/** Monday first, Sunday last — how a patient reads a week, not how Date numbers it. */
export const findOpeningHours = async (): Promise<OpeningHour[]> => {
  const hours = await prisma.openingHour.findMany();
  const weekPosition = (day: number) => (day === 0 ? 7 : day);

  return [...hours].sort((a, b) => weekPosition(a.dayOfWeek) - weekPosition(b.dayOfWeek));
};
