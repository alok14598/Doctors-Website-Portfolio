import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field, inputClass } from './Field';

describe('Field', () => {
  it('wires the label to the input', () => {
    render(
      <Field label="Phone number" required>
        {(props) => <input type="tel" {...props} />}
      </Field>,
    );

    expect(screen.getByLabelText(/Phone number/)).toBeInTheDocument();
  });

  it('marks an optional field so patients know they can skip it', () => {
    render(<Field label="Email address">{(props) => <input {...props} />}</Field>);

    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it('announces an error through aria-invalid and aria-describedby', () => {
    render(
      <Field label="Phone number" error="Please enter a reachable phone number" required>
        {(props) => <input type="tel" {...props} />}
      </Field>,
    );

    const input = screen.getByLabelText(/Phone number/);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Please enter a reachable phone number');
  });

  it('describes the input with the hint when there is no error', () => {
    render(
      <Field label="Phone number" hint="We call this number to confirm." required>
        {(props) => <input type="tel" {...props} />}
      </Field>,
    );

    expect(screen.getByLabelText(/Phone number/)).toHaveAccessibleDescription(
      'We call this number to confirm.',
    );
  });

  it('hides the hint once an error is showing, so only the fix is announced', () => {
    render(
      <Field label="Phone number" hint="We call this number." error="Required" required>
        {(props) => <input type="tel" {...props} />}
      </Field>,
    );

    expect(screen.queryByText('We call this number.')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Phone number/)).toHaveAccessibleDescription('Required');
  });

  it('gives each field a unique id so two on one page do not collide', () => {
    render(
      <>
        <Field label="First field">{(props) => <input {...props} />}</Field>
        <Field label="Second field">{(props) => <input {...props} />}</Field>
      </>,
    );

    const first = screen.getByLabelText(/First field/);
    const second = screen.getByLabelText(/Second field/);

    expect(first.id).not.toBe(second.id);
  });
});

describe('inputClass', () => {
  it('marks the border red only when there is an error', () => {
    expect(inputClass(true)).toContain('border-danger-600');
    expect(inputClass(false)).not.toContain('border-danger-600');
  });
});
