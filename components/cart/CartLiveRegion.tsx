'use client';

import type { ReactElement } from 'react';
import { useCartStore } from '@/lib/cart/store';

/** Visually hidden live region that announces cart additions to assistive tech. */
export function CartLiveRegion(): ReactElement {
  const items = useCartStore((state) => state.items);
  const lastItem = items[items.length - 1];
  const message = lastItem ? `Added ${lastItem.name} to cart` : '';

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}
