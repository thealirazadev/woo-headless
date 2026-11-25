import { describe, expect, it } from 'vitest';
import { decodeEntities, formatPrice } from '@/lib/format';

describe('formatPrice', () => {
  it('formats a numeric price string as US dollars by default', () => {
    expect(formatPrice('12.5')).toBe('$12.50');
    expect(formatPrice('1234')).toBe('$1,234.00');
  });

  it('returns the raw value when it is not a number', () => {
    expect(formatPrice('call for price')).toBe('call for price');
  });
});

describe('decodeEntities', () => {
  it('decodes named entities WordPress stores in names', () => {
    expect(decodeEntities('Salt &amp; Pepper')).toBe('Salt & Pepper');
    expect(decodeEntities('Tea &AMP; Cakes')).toBe('Tea & Cakes');
  });

  it('decodes decimal and hex numeric entities', () => {
    expect(decodeEntities('Caf&#233;')).toBe('Café');
    expect(decodeEntities('Caf&#xE9;')).toBe('Café');
    expect(decodeEntities('Caf&#XE9;')).toBe('Café');
  });

  it('leaves unknown or out-of-range entities untouched', () => {
    expect(decodeEntities('&bogus;')).toBe('&bogus;');
    expect(decodeEntities('&#0;')).toBe('&#0;');
    expect(decodeEntities('&#x110000;')).toBe('&#x110000;');
  });
});
