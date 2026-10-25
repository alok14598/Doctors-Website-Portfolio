const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const dayName = (dayOfWeek: number): string => DAY_NAMES[dayOfWeek] ?? 'Unknown';

export const shortDayName = (dayOfWeek: number): string => dayName(dayOfWeek).slice(0, 3);

/** Turns "09:00" into "9:00 am". Input is wall-clock clinic time, not an instant. */
export const formatClockTime = (time: string): string => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time;

  const hours = Number(match[1]);
  const minutes = match[2];
  if (hours > 23) return time;

  const suffix = hours < 12 ? 'am' : 'pm';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${minutes} ${suffix}`;
};

export const formatOpeningHour = (hour: {
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
}): string => {
  if (hour.isClosed || !hour.opensAt || !hour.closesAt) return 'Closed';
  return `${formatClockTime(hour.opensAt)} – ${formatClockTime(hour.closesAt)}`;
};

/** "22 October 2026" — unambiguous for patients, no locale guessing. */
export const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const formatDateTime = (date: Date | string): string =>
  new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** ISO yyyy-mm-dd, for <input type="date"> values. */
export const toDateInputValue = (date: Date): string => date.toISOString().slice(0, 10);

export const formatExperience = (years: number): string =>
  years === 1 ? '1 year of experience' : `${years} years of experience`;

export const formatDuration = (minutes: number | null): string | null => {
  if (minutes === null) return null;
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourLabel = hours === 1 ? '1 hour' : `${hours} hours`;

  return rest === 0 ? hourLabel : `${hourLabel} ${rest} min`;
};

export const formatConsultingDays = (days: number[]): string => {
  if (days.length === 0) return 'By appointment';
  if (days.length === 7) return 'Every day';

  return [...days]
    .sort((a, b) => a - b)
    .map(shortDayName)
    .join(', ');
};

export const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Digits only, for comparing two phone numbers that a patient may have typed
 * with different spacing. Display always uses the value as entered.
 */
export const normalisePhone = (phone: string): string => phone.replace(/\D/g, '');
