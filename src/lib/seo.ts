import type { Metadata } from 'next';
import type { ClinicProfile, OpeningHour } from '@prisma/client';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

export const absoluteUrl = (path: string): string =>
  `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Builds page metadata with a canonical URL. Titles are composed by the root
 * layout's `title.template`, so pass the bare page title here.
 */
export const pageMetadata = ({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata => ({
  title,
  description,
  alternates: { canonical: absoluteUrl(path) },
  openGraph: {
    title,
    description,
    url: absoluteUrl(path),
    type: 'website',
  },
  ...(noIndex ? { robots: { index: false, follow: false } } : {}),
});

const DAY_SCHEMA = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** schema.org MedicalClinic — what local search actually reads. */
export const medicalClinicJsonLd = (
  clinic: ClinicProfile,
  openingHours: OpeningHour[],
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: clinic.name,
  description: clinic.tagline,
  url: siteUrl,
  telephone: clinic.phone,
  email: clinic.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: [clinic.addressLine1, clinic.addressLine2].filter(Boolean).join(', '),
    addressLocality: clinic.city,
    addressRegion: clinic.state,
    postalCode: clinic.postalCode,
    addressCountry: clinic.country,
  },
  openingHoursSpecification: openingHours
    .filter((hour) => !hour.isClosed && hour.opensAt && hour.closesAt)
    .map((hour) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAY_SCHEMA[hour.dayOfWeek]}`,
      opens: hour.opensAt,
      closes: hour.closesAt,
    })),
});

export const physicianJsonLd = (doctor: {
  name: string;
  slug: string;
  designation: string;
  bio: string;
  specialty: { name: string };
}): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: doctor.name,
  jobTitle: doctor.designation,
  description: doctor.bio,
  medicalSpecialty: doctor.specialty.name,
  url: absoluteUrl(`/doctors/${doctor.slug}`),
});

export const faqJsonLd = (
  faqs: { question: string; answer: string }[],
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});
