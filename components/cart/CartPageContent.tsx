'use client';

import type { ReactElement } from 'react';
import { useCartStore, useCartHydrated } from '@/lib/cart/store';
import { getSubtotal } from '@/lib/cart/selectors';
import { formatPrice } from '@/lib/format';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface CartPageContentProps {
  storeBaseUrl: string;
}

/** Full cart page content: same data as the drawer, for direct navigation / small screens. */
export function CartPageContent({ storeBaseUrl }: CartPageContentProps): ReactElement {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartHydrated();
  const cartItems = hydrated ? items : [];
  const subtotal = getSubtotal(cartItems);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">Your cart</h1>
      {cartItems.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            heading="Your cart is empty"
            message="Add something you like to get started."
            action={<Button href="/">Browse products</Button>}
          />
        </div>
      ) : (
        <>
          <ul className="mt-6">
            {cartItems.map((item) => (
              <CartLineItem key={item.productId} item={item} />
            ))}
          </ul>
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center justify-between text-base font-semibold text-fg">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(String(subtotal))}</span>
            </div>
            <p className="mt-1 text-sm text-fg-muted">Shipping and taxes are calculated at checkout.</p>
            <div className="mt-4">
              <CheckoutButton storeBaseUrl={storeBaseUrl} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
