import { describe, expect, it } from 'vitest';
import { absoluteUrl, faqJsonLd, medicalClinicJsonLd, pageMetadata, physicianJsonLd } from './seo';
import { clinicProfile, openingHour } from '@/tests/fixtures';

const clinic = clinicProfile();

describe('absoluteUrl', () => {
  it('builds an absolute URL from a path with or without a leading slash', () => {
    expect(absoluteUrl('/doctors')).toMatch(/\/doctors$/);
    expect(absoluteUrl('doctors')).toMatch(/\/doctors$/);
  });
});

describe('pageMetadata', () => {
  it('sets a canonical URL for the page', () => {
    const metadata = pageMetadata({
      title: 'Services',
      description: 'What we treat.',
      path: '/services',
    });

    expect(metadata.alternates?.canonical).toMatch(/\/services$/);
    expect(metadata.openGraph?.title).toBe('Services');
  });

  it('adds noindex only when asked', () => {
    expect(pageMetadata({ title: 'A', description: 'B', path: '/a' }).robots).toBeUndefined();
    expect(
      pageMetadata({ title: 'A', description: 'B', path: '/a', noIndex: true }).robots,
    ).toEqual({ index: false, follow: false });
  });
});

describe('medicalClinicJsonLd', () => {
  it('describes the clinic as a MedicalClinic with a postal address', () => {
    const data = medicalClinicJsonLd(clinic, [openingHour(1)]);

    expect(data['@type']).toBe('MedicalClinic');
    expect(data.telephone).toBe('+91 80 4567 8900');
    expect(data.address).toMatchObject({
      streetAddress: '2nd Floor, Meridian House, 18th Main Road',
      postalCode: '560095',
    });
  });

  it('omits closed days from the opening hours specification', () => {
    const data = medicalClinicJsonLd(clinic, [
      openingHour(1),
      openingHour(0, { isClosed: true, opensAt: null, closesAt: null }),
    ]);

    expect(data.openingHoursSpecification).toHaveLength(1);
    expect((data.openingHoursSpecification as { dayOfWeek: string }[])[0]?.dayOfWeek).toBe(
      'https://schema.org/Monday',
    );
  });

  it('omits a day with a missing closing time rather than emitting a half range', () => {
    const data = medicalClinicJsonLd(clinic, [openingHour(2, { closesAt: null })]);

    expect(data.openingHoursSpecification).toHaveLength(0);
  });
});

describe('physicianJsonLd', () => {
  it('describes a doctor as a Physician with their specialty', () => {
    const data = physicianJsonLd({
      name: 'Dr. Ananya Rao',
      slug: 'ananya-rao',
      designation: 'Consultant Family Physician',
      bio: 'A biography.',
      specialty: { name: 'Family Medicine' },
    });

    expect(data['@type']).toBe('Physician');
    expect(data.medicalSpecialty).toBe('Family Medicine');
    expect(data.url).toMatch(/\/doctors\/ananya-rao$/);
  });
});

describe('faqJsonLd', () => {
  it('wraps each FAQ as a Question with an accepted answer', () => {
    const data = faqJsonLd([{ question: 'Do you treat emergencies?', answer: 'No.' }]);

    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'Do you treat emergencies?',
        acceptedAnswer: { '@type': 'Answer', text: 'No.' },
      },
    ]);
  });
});
