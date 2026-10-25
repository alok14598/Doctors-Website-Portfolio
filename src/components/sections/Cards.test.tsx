import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CTABand } from './CTABand';
import { DoctorCard } from './DoctorCard';
import { FACILITY_CATEGORY_LABELS, FacilityList } from './FacilityList';
import { PageHeader } from './PageHeader';
import { ServiceCard } from './ServiceCard';

const specialty = {
  id: 's1',
  name: 'Paediatrics',
  slug: 'paediatrics',
  summary: null,
  sortOrder: 1,
};

const doctor = {
  id: 'd1',
  name: 'Dr. Vikram Iyer',
  slug: 'vikram-iyer',
  designation: 'Consultant Paediatrician',
  qualifications: ['MBBS', 'MD (Paediatrics)'],
  bio: 'A biography.',
  photoUrl: null,
  experienceYears: 15,
  languages: ['English'],
  registrationNo: 'KMC/2010/24117',
  consultingDays: [1, 2],
  consultingHours: '9:00 am – 12:30 pm',
  sortOrder: 2,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  specialtyId: 's1',
  specialty,
};

const service = {
  id: 'sv1',
  name: 'Child Health & Immunisation',
  slug: 'child-health-immunisation',
  summary: 'Well-baby checks and the full national immunisation schedule.',
  description: 'Longer description.',
  category: 'PREVENTIVE' as const,
  durationMinutes: 25,
  preparation: null,
  sortOrder: 2,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DoctorCard', () => {
  it('links to the profile twice — the name and an explicit read-profile link', () => {
    render(<DoctorCard doctor={doctor} />);

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/doctors/vikram-iyer');
    }
  });

  it('names the doctor inside the read-profile link, so it is not a bare "Read profile"', () => {
    render(<DoctorCard doctor={doctor} />);

    expect(screen.getByText('for Dr. Vikram Iyer')).toBeInTheDocument();
  });

  it('shows the specialty, qualifications and consulting days', () => {
    render(<DoctorCard doctor={doctor} />);

    expect(screen.getByText('Paediatrics')).toBeInTheDocument();
    expect(screen.getByText('MBBS · MD (Paediatrics)')).toBeInTheDocument();
    expect(screen.getByText('Mon, Tue')).toBeInTheDocument();
    expect(screen.getByText('15 years of experience')).toBeInTheDocument();
  });

  it('shows no qualifications text when there are none', () => {
    render(<DoctorCard doctor={{ ...doctor, qualifications: [] }} />);

    expect(screen.queryByText(/MBBS/)).not.toBeInTheDocument();
  });
});

describe('ServiceCard', () => {
  it('links to the service and shows its typical length', () => {
    render(<ServiceCard service={service} />);

    expect(screen.getByRole('link', { name: 'Child Health & Immunisation' })).toHaveAttribute(
      'href',
      '/services/child-health-immunisation',
    );
    expect(screen.getByText('About 25 min')).toBeInTheDocument();
  });

  it('says the duration varies when none is recorded', () => {
    render(<ServiceCard service={{ ...service, durationMinutes: null }} />);

    expect(screen.getByText('Duration varies')).toBeInTheDocument();
  });
});

describe('FacilityList', () => {
  it('lists every facility with its description', () => {
    render(
      <FacilityList
        facilities={[
          {
            id: 'f1',
            name: 'Digital X-ray Suite',
            description: 'Low-dose digital radiography.',
            category: 'DIAGNOSTICS',
            sortOrder: 1,
            isActive: true,
          },
        ]}
      />,
    );

    expect(screen.getByText('Digital X-ray Suite')).toBeInTheDocument();
    expect(screen.getByText('Low-dose digital radiography.')).toBeInTheDocument();
  });

  it('labels every facility category', () => {
    expect(FACILITY_CATEGORY_LABELS.PHARMACY).toBe('Pharmacy');
    expect(Object.keys(FACILITY_CATEGORY_LABELS)).toHaveLength(4);
  });
});

describe('PageHeader', () => {
  it('renders the page h1 with the optional eyebrow and description', () => {
    render(<PageHeader eyebrow="Services" title="What we treat" description="Each service." />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('What we treat');
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Each service.')).toBeInTheDocument();
  });
});

describe('CTABand', () => {
  it('offers both the form and a tel: link, so calling is never hidden', () => {
    render(<CTABand phone="+91 80 4567 8900" />);

    expect(screen.getByRole('link', { name: 'Request an appointment' })).toHaveAttribute(
      'href',
      '/appointment',
    );
    expect(screen.getByRole('link', { name: /or call/ })).toHaveAttribute(
      'href',
      'tel:+918045678900',
    );
  });
});
