'use client';

import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { useCartStore, useCartHydrated } from '@/lib/cart/store';
import { getSubtotal } from '@/lib/cart/selectors';
import { formatPrice } from '@/lib/format';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface CartDrawerProps {
  storeBaseUrl: string;
}

/** Right-side cart drawer: focus-trapped while open, closes on Esc, returns focus to the trigger. */
export function CartDrawer({ storeBaseUrl }: CartDrawerProps): ReactElement | null {
  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const items = useCartStore((state) => state.items);
  const hydrated = useCartHydrated();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    triggerRef.current = document.activeElement;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        closeDrawer();
        return;
      }
      if (event.key !== 'Tab' || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  const cartItems = hydrated ? items : [];
  const subtotal = getSubtotal(cartItems);

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto rounded-l-lg
          bg-surface p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Cart</h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeDrawer}
            className="rounded-md p-2 text-sm font-medium text-fg hover:bg-surface-2
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-focus-ring"
          >
            Close
          </button>
        </div>
        {cartItems.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              heading="Your cart is empty"
              message="Add something you like to get started."
              action={
                <Button href="/" onClick={closeDrawer}>
                  Browse products
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <ul className="mt-4 flex-1">
              {cartItems.map((item) => (
                <CartLineItem key={item.productId} item={item} />
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm font-semibold text-fg">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(String(subtotal))}</span>
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                Shipping and taxes are calculated at checkout.
              </p>
              <div className="mt-4">
                <CheckoutButton storeBaseUrl={storeBaseUrl} />
              </div>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="mt-2 block rounded-md border border-border px-4 py-2 text-center text-sm
                  font-semibold text-fg hover:bg-surface-2"
              >
                View cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
