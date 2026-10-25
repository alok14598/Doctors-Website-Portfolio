import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from './TestimonialCard';

const testimonial = {
  id: 'one',
  patientName: 'Priya N.',
  rating: 4,
  quote: 'They called us for review rather than waiting for us to notice a problem.',
  treatment: 'Chronic care',
  isPublished: true,
  sortOrder: 1,
  createdAt: new Date('2026-01-01'),
};

describe('TestimonialCard', () => {
  it('states the rating in text for screen readers rather than only in stars', () => {
    render(<TestimonialCard testimonial={testimonial} />);

    expect(screen.getByLabelText('Rated 4 out of 5')).toBeInTheDocument();
  });

  it('shows the quote and who gave it', () => {
    render(<TestimonialCard testimonial={testimonial} />);

    expect(screen.getByText(/They called us for review/)).toBeInTheDocument();
    expect(screen.getByText('Priya N.')).toBeInTheDocument();
  });

  it('omits the treatment line when none is recorded', () => {
    render(<TestimonialCard testimonial={{ ...testimonial, treatment: null }} />);

    expect(screen.queryByText(/Chronic care/)).not.toBeInTheDocument();
  });
});
