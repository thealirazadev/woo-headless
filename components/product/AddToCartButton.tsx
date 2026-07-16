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
}

/** Adds the product to the cart store. Always disabled for out-of-stock products. */
export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  image,
  disabled = false,
}: AddToCartButtonProps): ReactElement {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => addItem({ productId, slug, name, priceAtAdd: price, image })}
    >
      {disabled ? 'Out of stock' : 'Add to cart'}
    </Button>
  );
}
