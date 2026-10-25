import { describe, expect, it } from 'vitest';
import {
  dayName,
  formatClockTime,
  formatConsultingDays,
  formatDuration,
  formatExperience,
  formatOpeningHour,
  shortDayName,
  titleCase,
} from './format';

describe('formatClockTime', () => {
  it('converts 24-hour clinic time to a 12-hour label', () => {
    expect(formatClockTime('09:00')).toBe('9:00 am');
    expect(formatClockTime('13:30')).toBe('1:30 pm');
  });

  it('renders midnight and noon without a zero hour', () => {
    expect(formatClockTime('00:15')).toBe('12:15 am');
    expect(formatClockTime('12:00')).toBe('12:00 pm');
  });

  it('returns the input unchanged when it is not a time', () => {
    expect(formatClockTime('closed')).toBe('closed');
    expect(formatClockTime('26:00')).toBe('26:00');
  });
});

describe('formatOpeningHour', () => {
  it('shows a range when the clinic is open', () => {
    expect(formatOpeningHour({ isClosed: false, opensAt: '09:00', closesAt: '20:00' })).toBe(
      '9:00 am – 8:00 pm',
    );
  });

  it('shows Closed when the day is marked closed', () => {
    expect(formatOpeningHour({ isClosed: true, opensAt: null, closesAt: null })).toBe('Closed');
  });

  it('shows Closed rather than a half range when a time is missing', () => {
    expect(formatOpeningHour({ isClosed: false, opensAt: '09:00', closesAt: null })).toBe('Closed');
  });
});

describe('dayName', () => {
  it('names the days of the week', () => {
    expect(dayName(0)).toBe('Sunday');
    expect(dayName(6)).toBe('Saturday');
    expect(shortDayName(1)).toBe('Mon');
  });

  it('does not crash on an out-of-range day', () => {
    expect(dayName(9)).toBe('Unknown');
  });
});

describe('formatConsultingDays', () => {
  it('lists days in week order regardless of input order', () => {
    expect(formatConsultingDays([5, 1, 3])).toBe('Mon, Wed, Fri');
  });

  it('collapses a full week', () => {
    expect(formatConsultingDays([0, 1, 2, 3, 4, 5, 6])).toBe('Every day');
  });

  it('falls back when no days are set', () => {
    expect(formatConsultingDays([])).toBe('By appointment');
  });
});

describe('formatDuration', () => {
  it('shows minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  it('shows hours and remaining minutes', () => {
    expect(formatDuration(60)).toBe('1 hour');
    expect(formatDuration(90)).toBe('1 hour 30 min');
    expect(formatDuration(120)).toBe('2 hours');
  });

  it('returns null when no duration is recorded', () => {
    expect(formatDuration(null)).toBeNull();
  });
});

describe('formatExperience', () => {
  it('singularises a single year', () => {
    expect(formatExperience(1)).toBe('1 year of experience');
    expect(formatExperience(12)).toBe('12 years of experience');
  });
});

describe('titleCase', () => {
  it('turns an enum value into a label', () => {
    expect(titleCase('FIRST_VISIT')).toBe('First Visit');
  });
});
