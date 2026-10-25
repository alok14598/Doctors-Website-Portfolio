import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins the truthy values', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops the falsy values a conditional produces', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });
});
