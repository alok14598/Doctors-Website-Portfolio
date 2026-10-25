import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, ButtonLink } from './Button';

describe('Button', () => {
  it('renders a button element, not a link', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('can be disabled while an action is in flight', () => {
    render(<Button disabled>Saving…</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies the variant and size requested', () => {
    render(
      <Button variant="danger" size="lg">
        Withdraw
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button.className).toContain('text-danger-600');
    expect(button.className).toContain('text-base');
  });
});

describe('ButtonLink', () => {
  it('renders a link so navigation is never a button', () => {
    render(<ButtonLink href="/appointment">Book</ButtonLink>);

    const link = screen.getByRole('link', { name: 'Book' });
    expect(link).toHaveAttribute('href', '/appointment');
  });
});
