import type { Metadata } from 'next';
import { getPublicEnv, getServerEnv } from '@/lib/env';
import { Header } from '@/components/layout/Header';
import { ThemeScript } from '@/components/layout/ThemeScript';
import { CartLiveRegion } from '@/components/cart/CartLiveRegion';
import { CartDrawer } from '@/components/cart/CartDrawer';
import './globals.css';

const { storeName } = getPublicEnv();

export const metadata: Metadata = {
  title: storeName,
  description: `${storeName} storefront`,
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { storeUrl } = getServerEnv();

  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <CartLiveRegion />
        <CartDrawer storeBaseUrl={storeUrl} />
      </body>
    </html>
  );
}
