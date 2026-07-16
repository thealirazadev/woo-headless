'use client';

import type { ReactElement } from 'react';
import { useCartStore, useCartHydrated } from '@/lib/cart/store';
import { getItemCount } from '@/lib/cart/selectors';

/** Header cart trigger: opens the drawer and shows the current item count as a badge. */
export function CartButton(): ReactElement {
  const items = useCartStore((state) => state.items);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const hydrated = useCartHydrated();
  const count = hydrated ? getItemCount(items) : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-fg
        hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-focus-ring"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        />
      </svg>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center
            rounded-full bg-accent px-1 text-xs font-semibold text-accent-fg"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
