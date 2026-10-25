import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import { Footer } from './Footer';
import { clinicProfile, openingHour } from '@/tests/fixtures';
import { Section, SectionHeading } from './Section';

const clinic = clinicProfile();
const openingHours = [openingHour(1)];

describe('Container', () => {
  it('narrows when asked', () => {
    const { container } = render(<Container width="narrow">Body</Container>);

    expect((container.firstChild as HTMLElement).className).toContain('max-w-3xl');
  });
});

describe('Section', () => {
  it('tints a muted section to separate it without a rule', () => {
    const { container } = render(<Section tone="muted">Body</Section>);

    expect((container.firstChild as HTMLElement).className).toContain('bg-surface-2');
  });
});

describe('SectionHeading', () => {
  it('renders an h2, so page structure stays below the single h1', () => {
    render(<SectionHeading eyebrow="About" title="Our doctors" description="A description." />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our doctors');
    expect(screen.getByText('About')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('shows the address, contact details and opening hours', () => {
    render(<Footer clinic={clinic} openingHours={openingHours} />);

    // The address is split across <br/> elements, so match the whole block.
    expect(document.querySelector('address')?.textContent).toContain('2nd Floor, Meridian House');
    expect(screen.getByRole('link', { name: '+91 80 4567 8900' })).toHaveAttribute(
      'href',
      'tel:+918045678900',
    );
    expect(screen.getByText('9:00 am – 8:00 pm')).toBeInTheDocument();
  });

  it('states plainly that the clinic is not an emergency service', () => {
    render(<Footer clinic={clinic} openingHours={openingHours} />);

    expect(screen.getByText('Not an emergency service.')).toBeInTheDocument();
    expect(screen.getByText(/call 108/)).toBeInTheDocument();
  });

  it('omits the emergency band when no note is set', () => {
    render(<Footer clinic={{ ...clinic, emergencyNote: null }} openingHours={openingHours} />);

    expect(screen.queryByText('Not an emergency service.')).not.toBeInTheDocument();
  });

  it('links to the staff sign-in without advertising it as a patient route', () => {
    render(<Footer clinic={clinic} openingHours={openingHours} />);

    expect(screen.getByRole('link', { name: 'Staff sign in' })).toHaveAttribute(
      'href',
      '/admin/login',
    );
  });
});
