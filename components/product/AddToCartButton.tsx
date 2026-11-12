'use client';

import type { ReactElement } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/cart/store';

interface AddToCartButtonProps {
  productId: number;
  slug: string;
  name: string;
  price: string;
  image: { src: string; alt: string } | null;
  disabled?: boolean;
  /** False when the store will not sell this item (for example, it has no price). */
  purchasable?: boolean;
  /** Store product page for items that need options chosen there (variable, grouped, external). */
  optionsUrl?: string;
}

/**
 * Adds the product to the cart store. Disabled for out-of-stock or unpurchasable products.
 * Products the cart cannot hold as a single id (variable, grouped, external) link to the
 * store's product page instead, since the checkout link would reject them.
 */
export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  image,
  disabled = false,
  purchasable = true,
  optionsUrl,
}: AddToCartButtonProps): ReactElement {
  const addItem = useCartStore((state) => state.addItem);

  if (optionsUrl) {
    return <Button href={optionsUrl}>Choose options</Button>;
  }

  return (
    <Button
      type="button"
      disabled={disabled || !purchasable}
      onClick={() => addItem({ productId, slug, name, priceAtAdd: price, image })}
    >
      {disabled ? 'Out of stock' : purchasable ? 'Add to cart' : 'Unavailable'}
    </Button>
  );
}
