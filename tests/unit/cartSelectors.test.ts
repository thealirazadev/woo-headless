import { describe, expect, it } from 'vitest';
import { getItemCount, getLineTotal, getSubtotal } from '@/lib/cart/selectors';
import type { CartItem } from '@/lib/types';

const items: CartItem[] = [
  { productId: 1, slug: 'a', name: 'A', priceAtAdd: '10.00', image: null, quantity: 2 },
  { productId: 2, slug: 'b', name: 'B', priceAtAdd: '5.50', image: null, quantity: 3 },
];

describe('cart selectors', () => {
  it('counts total quantity across all lines', () => {
    expect(getItemCount(items)).toBe(5);
  });

  it('computes a single line total', () => {
    expect(getLineTotal(items[0]!)).toBe(20);
  });

  it('computes the subtotal across all lines', () => {
    expect(getSubtotal(items)).toBeCloseTo(36.5);
  });

  it('returns 0 for an empty cart', () => {
    expect(getItemCount([])).toBe(0);
    expect(getSubtotal([])).toBe(0);
  });
});
