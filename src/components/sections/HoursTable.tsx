'use client';

import type { OpeningHour } from '@prisma/client';
import { dayName, formatOpeningHour } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useClientDayOfWeek } from '@/lib/useClientDate';

export function HoursTable({ openingHours }: { openingHours: OpeningHour[] }) {
  // Resolved client-side: these pages are statically generated, so a server
  // `new Date()` would freeze "Today" on the build day.
  const today = useClientDayOfWeek();

  return (
    <dl className="divide-border divide-y">
      {openingHours.map((hour) => {
        const isToday = hour.dayOfWeek === today;

        return (
          <div
            key={hour.dayOfWeek}
            className={cn(
              'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3',
              isToday && 'font-medium',
            )}
          >
            <dt className={cn('text-sm', isToday ? 'text-ink-900' : 'text-ink-600')}>
              {dayName(hour.dayOfWeek)}
              {isToday ? <span className="text-accent-700 ml-2 text-xs">Today</span> : null}
            </dt>
            <dd className="text-ink-900 text-sm">{formatOpeningHour(hour)}</dd>
            {hour.note ? <dd className="text-ink-400 w-full text-xs">{hour.note}</dd> : null}
          </div>
        );
      })}
    </dl>
  );
}
