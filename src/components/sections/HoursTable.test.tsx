import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { dayName } from '@/lib/format';
import { HoursTable } from './HoursTable';

const hour = (dayOfWeek: number, overrides: Record<string, unknown> = {}) => ({
  id: `h${dayOfWeek}`,
  dayOfWeek,
  isClosed: false,
  opensAt: '09:00',
  closesAt: '20:00',
  note: null,
  ...overrides,
});

describe('HoursTable', () => {
  it('renders a readable range per day', () => {
    render(<HoursTable openingHours={[hour(1)]} />);

    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('9:00 am – 8:00 pm')).toBeInTheDocument();
  });

  it('shows Closed for a closed day', () => {
    render(
      <HoursTable openingHours={[hour(0, { isClosed: true, opensAt: null, closesAt: null })]} />,
    );

    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('marks today so a visitor does not have to work it out', () => {
    const today = new Date().getDay();

    render(<HoursTable openingHours={[hour(today)]} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText(dayName(today))).toBeInTheDocument();
  });

  it('shows a day note when there is one', () => {
    render(<HoursTable openingHours={[hour(6, { note: 'Dental by appointment only' })]} />);

    expect(screen.getByText('Dental by appointment only')).toBeInTheDocument();
  });
});

/**
 * These pages are statically generated. A server-side `new Date()` baked the
 * build day into the HTML, so every visitor saw the same weekday marked
 * "Today" until the next deploy.
 */
describe('HoursTable and the build-time date trap', () => {
  it('marks today for the visitor, not for whenever the page was built', async () => {
    const today = new Date().getDay();
    const otherDay = (today + 3) % 7;

    render(<HoursTable openingHours={[hour(today), hour(otherDay)]} />);

    // The marker appears after mount, once the browser's date is known.
    expect(await screen.findByText('Today')).toBeInTheDocument();
    expect(screen.getAllByText('Today')).toHaveLength(1);
  });

  it('renders every day even before the client date resolves', () => {
    const { container } = render(<HoursTable openingHours={[hour(1), hour(2), hour(3)]} />);

    expect(container.querySelectorAll('dt')).toHaveLength(3);
  });
});
