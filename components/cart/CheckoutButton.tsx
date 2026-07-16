'use client';

import type { ReactElement } from 'react';
import { useCartStore, useCartHydrated } from '@/lib/cart/store';
import { buildCheckoutUrl } from '@/lib/cart/checkout';
import { Button } from '@/components/ui/Button';

interface CheckoutButtonProps {
  storeBaseUrl: string;
}

/** Redirects to the WooCommerce store checkout with the current cart. Disabled when empty. */
export function CheckoutButton({ storeBaseUrl }: CheckoutButtonProps): ReactElement {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartHydrated();
  const cartItems = hydrated ? items : [];

  if (cartItems.length === 0) {
    return (
      <Button type="button" disabled className="w-full justify-center">
        Checkout
      </Button>
    );
  }

  return (
    <Button href={buildCheckoutUrl(storeBaseUrl, cartItems)} className="w-full justify-center">
      Checkout
    </Button>
  );
}
