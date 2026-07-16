import { describe, expect, it } from 'vitest';
import { parsePageParam } from '@/lib/pagination';

describe('parsePageParam', () => {
  it('defaults to 1 when the param is missing', () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it('parses a valid numeric string', () => {
    expect(parsePageParam('3')).toBe(3);
  });

  it('clamps invalid, zero, or negative values to 1', () => {
    expect(parsePageParam('-5')).toBe(1);
    expect(parsePageParam('0')).toBe(1);
    expect(parsePageParam('not-a-number')).toBe(1);
  });

  it('uses the first value when given an array', () => {
    expect(parsePageParam(['2', '5'])).toBe(2);
  });
});
