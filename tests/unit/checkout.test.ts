import { describe, expect, it } from 'vitest';
import { buildCheckoutUrl } from '@/lib/cart/checkout';
import type { CartItem } from '@/lib/types';

const items: CartItem[] = [
  { productId: 1, slug: 'a', name: 'A', priceAtAdd: '10.00', image: null, quantity: 2 },
  { productId: 2, slug: 'b', name: 'B', priceAtAdd: '5.50', image: null, quantity: 1 },
];

describe('buildCheckoutUrl', () => {
  it('builds a checkout URL under the store base', () => {
    const url = buildCheckoutUrl('https://store.example.com', items);
    expect(url.startsWith('https://store.example.com/checkout')).toBe(true);
  });

  it('encodes each item as a product id / quantity pair', () => {
    const url = new URL(buildCheckoutUrl('https://store.example.com', items));
    expect(url.searchParams.getAll('add-to-cart[]')).toEqual(['1', '2']);
    expect(url.searchParams.getAll('quantity[]')).toEqual(['2', '1']);
  });

  it('produces a bare checkout URL for an empty cart', () => {
    const url = buildCheckoutUrl('https://store.example.com', []);
    expect(url).toBe('https://store.example.com/checkout');
  });

  it('never includes a consumer key or secret', () => {
    const url = buildCheckoutUrl('https://store.example.com', items);
    expect(url).not.toContain('consumer_key');
    expect(url).not.toContain('consumer_secret');
  });
});
