import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState, ErrorNotice, SkeletonLines, SuccessNotice } from './States';

describe('EmptyState', () => {
  it('shows a title, and a description when given one', () => {
    render(<EmptyState title="No requests here" description="They will appear here." />);

    expect(screen.getByText('No requests here')).toBeInTheDocument();
    expect(screen.getByText('They will appear here.')).toBeInTheDocument();
  });

  it('works without a description', () => {
    render(<EmptyState title="Nothing yet" />);

    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
  });
});

describe('ErrorNotice', () => {
  it('is announced as an alert, so a failure is not silent', () => {
    render(<ErrorNotice>Could not save.</ErrorNotice>);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not save.');
  });
});

describe('SuccessNotice', () => {
  it('is announced as a status rather than interrupting as an alert', () => {
    render(<SuccessNotice>Saved.</SuccessNotice>);

    expect(screen.getByRole('status')).toHaveTextContent('Saved.');
  });
});

describe('SkeletonLines', () => {
  it('is hidden from assistive technology, being purely visual', () => {
    const { container } = render(<SkeletonLines lines={2} />);

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root.children).toHaveLength(2);
  });
});
