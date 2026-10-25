import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

/**
 * next/image refuses any host that is not in `images.remotePatterns`, and the
 * refusal is a thrown error, not a broken image — one remote URL typed into
 * the admin form took down /doctors and every doctor profile with a 500.
 *
 * The form now rejects remote URLs, but seed data and direct SQL bypass the
 * form, so the component has to stand on its own.
 */
describe('Avatar with an unusable photo path', () => {
  it('falls back to initials for a remote URL instead of crashing the page', () => {
    render(<Avatar name="Dr. Ananya Rao" photoUrl="https://images.example.com/dr.jpg" />);

    expect(screen.getByText('AR')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('falls back to initials for a protocol-relative URL', () => {
    render(<Avatar name="Dr. Ananya Rao" photoUrl="//images.example.com/dr.jpg" />);

    expect(screen.getByText('AR')).toBeInTheDocument();
  });

  it('falls back to initials for a path that is not app-rooted', () => {
    render(<Avatar name="Dr. Ananya Rao" photoUrl="doctors/ananya.jpg" />);

    expect(screen.getByText('AR')).toBeInTheDocument();
  });

  it('still renders a genuine app-rooted path', () => {
    render(<Avatar name="Dr. Ananya Rao" photoUrl="/doctors/ananya.jpg" />);

    expect(document.querySelector('img')).toHaveAttribute('alt', 'Portrait of Dr. Ananya Rao');
  });
});
