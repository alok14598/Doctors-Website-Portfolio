import type { SVGProps } from 'react';

/**
 * A small inline icon set, drawn here rather than pulled from a package.
 *
 * The site needs about a dozen glyphs; an icon library would ship thousands
 * and a tree-shaking config to go with it. These are 24×24 stroked paths on a
 * common grid, so they sit together without optical adjustment.
 *
 * Every icon is decorative — the label beside it carries the meaning — so they
 * are marked aria-hidden at source and never need an accessible name.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export function StethoscopeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M10 15v1a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="11" r="2" />
      <path d="M6 3H4.5M14 3h1.5" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8L15 10" />
    </svg>
  );
}

export function HeartPulseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
      <path d="M5.5 12.5h3L10 10.5l1.8 4 1.7-2.5h3.6" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.4" />
      <path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5V6M16 3.5V6" />
      <path d="M8 13h2M8 16.5h2M14 13h2" />
    </svg>
  );
}

export function FlaskIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3v6.2L5.2 17A2 2 0 0 0 6.9 20h10.2a2 2 0 0 0 1.7-3L14 9.2V3" />
      <path d="M9 3h6M7.6 14.5h8.8" />
    </svg>
  );
}

export function ToothIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4.5c-1.6-1-3.4-1.3-4.8-.5C5.4 5.1 5 7.6 5.6 10c.5 2 .7 3.3.9 5 .2 1.9.6 4 1.9 4s1.4-2.3 1.9-4c.3-1 .9-1.6 1.7-1.6s1.4.6 1.7 1.6c.5 1.7.6 4 1.9 4s1.7-2.1 1.9-4c.2-1.7.4-3 .9-5 .6-2.4.2-4.9-1.6-6-1.4-.8-3.2-.5-4.8.5Z" />
    </svg>
  );
}

export function ScanIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M20 8.5V6a2 2 0 0 0-2-2h-2.5M4 15.5V18a2 2 0 0 0 2 2h2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function PillIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.8" y="8.5" width="18.4" height="7" rx="3.5" transform="rotate(-45 12 12)" />
      <path d="m9.2 9.2 5.6 5.6" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.2 4h2.3l1.3 3.4-1.7 1.2a11 11 0 0 0 4.6 4.6l1.2-1.7 3.4 1.3v2.3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 5.2 6.2 2 2 0 0 1 7.2 4Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s6.5-5.6 6.5-10.3A6.5 6.5 0 0 0 5.5 10.7C5.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12h14M13 6.5l5.5 5.5L13 17.5" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2.2, ...props })}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

/** Fallback glyph per service category. */
export const SERVICE_CATEGORY_ICONS = {
  CONSULTATION: StethoscopeIcon,
  DIAGNOSTICS: ScanIcon,
  PROCEDURE: HeartPulseIcon,
  PREVENTIVE: ShieldIcon,
  DENTAL: ToothIcon,
} as const;

/**
 * Per-service glyphs. Services are clinic data, so this is a best-effort map
 * keyed on slug — anything unlisted falls back to its category icon, which
 * means adding a service in the admin never leaves a blank chip.
 *
 * Worth having: inside a category-grouped list every card would otherwise
 * carry the same glyph, which is decoration rather than information.
 */
const SERVICE_SLUG_ICONS: Record<string, typeof StethoscopeIcon> = {
  'general-consultation': StethoscopeIcon,
  'child-health-immunisation': UsersIcon,
  'annual-health-check': ShieldIcon,
  'skin-hair-clinic': ShieldIcon,
  'minor-procedures': HeartPulseIcon,
  'orthopaedic-assessment': HeartPulseIcon,
  'womens-health-antenatal-care': UsersIcon,
  'diagnostic-laboratory': FlaskIcon,
  'digital-xray-ecg': ScanIcon,
  'dental-care': ToothIcon,
};

export const serviceIcon = (
  slug: string,
  category: keyof typeof SERVICE_CATEGORY_ICONS,
): typeof StethoscopeIcon => SERVICE_SLUG_ICONS[slug] ?? SERVICE_CATEGORY_ICONS[category];

/** Maps a facility category to the glyph that fronts it. */
export const FACILITY_CATEGORY_ICONS = {
  DIAGNOSTICS: ScanIcon,
  TREATMENT: HeartPulseIcon,
  PHARMACY: PillIcon,
  AMENITY: UsersIcon,
} as const;
