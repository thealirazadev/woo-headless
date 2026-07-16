'use client';

import Image from 'next/image';
import type { ReactElement } from 'react';
import type { CartItem } from '@/lib/types';
import { useCartStore } from '@/lib/cart/store';
import { getLineTotal } from '@/lib/cart/selectors';
import { formatPrice } from '@/lib/format';

interface CartLineItemProps {
  item: CartItem;
}

/** One cart line: thumbnail, name, unit price, quantity stepper, line total, and remove. */
export function CartLineItem({ item }: CartLineItemProps): ReactElement {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const image = item.image ?? { src: '/placeholder-product.svg', alt: item.name };

  return (
    <li className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-surface-2">
        <Image src={image.src} alt={image.alt} fill sizes="64px" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-medium text-fg">{item.name}</span>
        <span className="text-sm text-fg-muted">{formatPrice(item.priceAtAdd)}</span>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={item.quantity <= 1}
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border
              text-fg hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            -
          </button>
          <span aria-live="polite" className="w-6 text-center text-sm tabular-nums text-fg">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border
              text-fg hover:bg-surface-2"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="ml-auto text-xs font-semibold text-danger hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
      <span className="text-sm font-semibold tabular-nums text-fg">
        {formatPrice(String(getLineTotal(item)))}
      </span>
    </li>
  );
}
