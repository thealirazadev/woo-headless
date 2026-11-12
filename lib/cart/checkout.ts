import type { CartItem } from '@/lib/types';

/**
 * Builds the WooCommerce checkout handoff URL from the public store base and the cart
 * contents. Only product ids and quantities are encoded; no consumer key/secret ever
 * appears here (those never leave the server - see lib/env.ts / lib/woocommerce/client.ts).
 *
 * Uses WooCommerce's shareable checkout link, `/checkout-link/?products=id:qty,id:qty`,
 * which fills the cart session and redirects to checkout. Core WooCommerce ignores
 * `add-to-cart[]` arrays, so that form left the store cart empty (verified on 11.3).
 */
export function buildCheckoutUrl(storeBaseUrl: string, items: CartItem[]): string {
  if (items.length === 0) return new URL('/checkout', storeBaseUrl).toString();
  const url = new URL('/checkout-link/', storeBaseUrl);
  url.searchParams.set(
    'products',
    items.map((item) => `${item.productId}:${item.quantity}`).join(','),
  );
  return url.toString();
}
