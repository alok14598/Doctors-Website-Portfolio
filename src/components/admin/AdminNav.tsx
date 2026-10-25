'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const ADMIN_LINKS = [
  { href: '/admin/appointments', label: 'Appointments' },
  { href: '/admin/doctors', label: 'Doctors' },
  { href: '/admin/services', label: 'Services' },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Staff area" className="flex items-center gap-1">
      {ADMIN_LINKS.map((link) => {
        const isCurrent = pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'rounded-pill px-3.5 py-1.5 text-sm transition-colors duration-200',
              isCurrent
                ? 'text-ink-900 bg-surface-2 font-medium'
                : 'text-ink-600 hover:text-ink-900',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
