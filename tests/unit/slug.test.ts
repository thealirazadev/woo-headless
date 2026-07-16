import { describe, expect, it } from 'vitest';
import { isValidSlug } from '@/lib/slug';

describe('isValidSlug', () => {
  it('accepts lowercase alphanumeric slugs with hyphens', () => {
    expect(isValidSlug('widget')).toBe(true);
    expect(isValidSlug('blue-widget-2')).toBe(true);
  });

  it('rejects empty, uppercase, or malformed values', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('Widget')).toBe(false);
    expect(isValidSlug('widget/../etc')).toBe(false);
    expect(isValidSlug('-widget')).toBe(false);
    expect(isValidSlug('widget-')).toBe(false);
    expect(isValidSlug('widget space')).toBe(false);
  });
});
