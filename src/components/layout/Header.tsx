'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './Container';
import { ButtonLink } from '../ui/Button';
import { HeartPulseIcon, PhoneIcon } from '../ui/Icon';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/facilities', label: 'Facilities' },
  { href: '/patient-info', label: 'Patient Info' },
  { href: '/contact', label: 'Contact' },
] as const;

export function Header({ clinicName, phone }: { clinicName: string; phone: string }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // The menu closes when a link in it is tapped. Doing this on click rather
  // than in an effect keyed on the pathname avoids a cascading render, and it
  // also closes the panel when the tapped link is the current page.
  const closeMenu = () => setIsMenuOpen(false);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-border bg-surface/90 sticky top-0 z-40 border-b backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="bg-accent-600 flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
          >
            <HeartPulseIcon className="size-5.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-ink-900 text-[17px] font-extrabold tracking-[-0.02em] whitespace-nowrap">
              {clinicName}
            </span>
            <span className="text-ink-400 mt-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
              Primary care clinic
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? 'page' : undefined}
              className={cn(
                'rounded-pill px-3 py-2 text-[15px] font-medium whitespace-nowrap transition-colors duration-200',
                isCurrent(link.href)
                  ? 'bg-accent-50 text-accent-600'
                  : 'text-ink-600 hover:text-accent-600',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          {/* The responsive hiding lives on these wrappers, not on the button:
              `hidden` on ButtonLink would lose to the `inline-flex` in its own
              base class and the CTA would leak onto narrow screens. */}
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="group hidden items-center gap-2.5 md:flex"
          >
            <span className="bg-accent-50 text-accent-600 group-hover:bg-accent-600 flex size-10 items-center justify-center rounded-full transition-colors group-hover:text-white">
              <PhoneIcon className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-ink-400 text-[11px] font-medium">Call us today</span>
              <span className="text-ink-900 text-sm font-bold whitespace-nowrap">{phone}</span>
            </span>
          </a>

          <div className="hidden lg:block">
            <ButtonLink href="/appointment" size="sm">
              Book appointment
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            className="border-border-strong rounded-pill hover:bg-surface-2 border px-4 py-2 text-sm font-medium transition-colors duration-200 xl:hidden"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </Container>

      {isMenuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-border bg-surface border-t xl:hidden"
        >
          <Container className="flex flex-col py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                className={cn(
                  'rounded-field px-3 py-3 text-[15px]',
                  isCurrent(link.href) ? 'text-accent-600 font-semibold' : 'text-ink-600',
                )}
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href="/appointment" onClick={closeMenu} className="my-3">
              Book appointment
            </ButtonLink>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
