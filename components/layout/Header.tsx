import Link from 'next/link';
import type { ReactElement } from 'react';
import { getPublicEnv } from '@/lib/env';
import { CartButton } from '@/components/cart/CartButton';

const NAV_LINK_CLASSES =
  'text-sm font-medium text-fg-muted hover:text-fg focus-visible:outline focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

/** Sticky site header: store name (home link), primary nav, and the cart trigger. */
export function Header(): ReactElement {
  const { storeName } = getPublicEnv();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold text-fg focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {storeName}
        </Link>
        <nav aria-label="Primary" className="flex flex-1 items-center gap-6">
          <Link href="/" className={NAV_LINK_CLASSES}>
            All products
          </Link>
          <Link href="/category" className={NAV_LINK_CLASSES}>
            Categories
          </Link>
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
