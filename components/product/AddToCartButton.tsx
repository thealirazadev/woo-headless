'use client';

import type { ReactElement } from 'react';
import { Button } from '@/components/ui/Button';

interface AddToCartButtonProps {
  disabled?: boolean;
}

/**
 * Add-to-cart affordance. The button is present from Phase 3; it is wired to the
 * cart store in Phase 4. Always disabled for out-of-stock products.
 */
export function AddToCartButton({ disabled = false }: AddToCartButtonProps): ReactElement {
  return (
    <Button type="button" disabled={disabled}>
      {disabled ? 'Out of stock' : 'Add to cart'}
    </Button>
  );
}
