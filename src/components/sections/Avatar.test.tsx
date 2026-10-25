import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('shows initials when there is no photograph', () => {
    render(<Avatar name="Dr. Ananya Rao" photoUrl={null} />);

    expect(screen.getByText('AR')).toBeInTheDocument();
  });

  it('drops the Dr. prefix rather than using it as an initial', () => {
    render(<Avatar name="Dr. Vikram Iyer" photoUrl={null} />);

    expect(screen.getByText('VI')).toBeInTheDocument();
  });

  it('uses at most two initials', () => {
    render(<Avatar name="Dr. Fatima Noor Sheikh" photoUrl={null} />);

    expect(screen.getByText('FN')).toBeInTheDocument();
  });

  it('renders the photograph with an alt text naming the doctor', () => {
    render(<Avatar name="Dr. Meera Krishnan" photoUrl="/doctors/meera.jpg" />);

    expect(screen.getByAltText('Portrait of Dr. Meera Krishnan')).toBeInTheDocument();
  });
});
