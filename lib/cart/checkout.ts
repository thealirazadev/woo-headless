import type { CartItem } from '@/lib/types';

/**
 * Builds the WooCommerce checkout redirect URL from the public store base and the
 * cart contents. Only product ids and quantities are encoded; no consumer key/secret
 * ever appears here (those never leave the server - see lib/env.ts / lib/woocommerce/client.ts).
 *
 * Encodes items as repeated `add-to-cart[]` / `quantity[]` params, the common convention
 * for adding several products to the WooCommerce session cart in one request. A store
 * without a matching bulk-add handler may need this adjusted - flagged in docs/memory.md
 * as something a human with real store credentials should verify.
 */
export function buildCheckoutUrl(storeBaseUrl: string, items: CartItem[]): string {
  const url = new URL('/checkout', storeBaseUrl);
  for (const item of items) {
    url.searchParams.append('add-to-cart[]', String(item.productId));
    url.searchParams.append('quantity[]', String(item.quantity));
  }
  return url.toString();
}
