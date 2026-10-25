import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { clinicProfile } from '@/tests/fixtures';
import { Hero } from './Hero';

const clinic = clinicProfile({
  heroTitle: 'Trusted family care',
  heroTitleAccent: 'for a healthier you',
});

const stats = [
  { label: 'Patients cared for', value: '50K+', caption: 'Across Koramangala since 2011.' },
  { label: 'Would recommend us', value: '98%', caption: 'From post-visit feedback.' },
];

describe('Hero', () => {
  it('renders the hero title and its accented half as one h1', () => {
    render(<Hero clinic={clinic} stats={stats} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Trusted family care for a healthier you');
  });

  it('falls back to the tagline when no hero title is set', () => {
    render(<Hero clinic={{ ...clinic, heroTitle: null, heroTitleAccent: null }} stats={stats} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Everyday care, delivered carefully.',
    );
  });

  it('shows only the first paragraph of the about text', () => {
    render(<Hero clinic={clinic} stats={stats} />);

    expect(screen.getByText('The opening paragraph patients read first.')).toBeInTheDocument();
    expect(screen.queryByText(/A second paragraph/)).not.toBeInTheDocument();
  });

  it('offers both calls to action', () => {
    render(<Hero clinic={clinic} stats={stats} />);

    expect(screen.getByRole('link', { name: /Book appointment/ })).toHaveAttribute(
      'href',
      '/appointment',
    );
    expect(screen.getByRole('link', { name: 'Meet the doctors' })).toHaveAttribute(
      'href',
      '/doctors',
    );
  });

  it('renders both floating stat cards with their captions', () => {
    render(<Hero clinic={clinic} stats={stats} />);

    expect(screen.getByText('50K+')).toBeInTheDocument();
    expect(screen.getByText('Would recommend us')).toBeInTheDocument();
    expect(screen.getByText('From post-visit feedback.')).toBeInTheDocument();
  });

  it('renders the clinic photograph when one is configured', () => {
    render(<Hero clinic={{ ...clinic, heroImageUrl: '/clinic/reception.jpg' }} stats={stats} />);

    // Decorative: the headline beside it carries the meaning, so the alt is empty.
    const image = document.querySelector('img');
    expect(image).toHaveAttribute('alt', '');
  });

  it('still renders without a photograph rather than leaving a gap', () => {
    const { container } = render(<Hero clinic={clinic} stats={stats} />);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
