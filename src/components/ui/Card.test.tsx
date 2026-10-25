import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Inside</Card>);

    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('only adds the hover lift when the card is interactive', () => {
    const { container: plain } = render(<Card>Plain</Card>);
    const { container: interactive } = render(<Card interactive>Clickable</Card>);

    expect((plain.firstChild as HTMLElement).className).not.toContain('hover:shadow-lift');
    expect((interactive.firstChild as HTMLElement).className).toContain('hover:shadow-lift');
  });
});

describe('Badge', () => {
  it('renders the label with the requested tone', () => {
    render(<Badge tone="success">Confirmed</Badge>);

    const badge = screen.getByText('Confirmed');
    expect(badge.className).toContain('text-success-600');
  });

  it('defaults to the neutral tone', () => {
    render(<Badge>Hidden</Badge>);

    expect(screen.getByText('Hidden').className).toContain('text-ink-700');
  });
});
