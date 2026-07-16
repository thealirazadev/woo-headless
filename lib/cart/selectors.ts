import type { CartItem } from '@/lib/types';

/** Total quantity across all cart lines. */
export function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Line total (unit price captured at add time * quantity) for a single cart item. */
export function getLineTotal(item: CartItem): number {
  return Number(item.priceAtAdd) * item.quantity;
}

/** Cart subtotal: sum of all line totals. */
export function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getLineTotal(item), 0);
}
