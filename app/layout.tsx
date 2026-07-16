import type { Metadata } from 'next';
import { getPublicEnv } from '@/lib/env';
import './globals.css';

const { storeName } = getPublicEnv();

export const metadata: Metadata = {
  title: storeName,
  description: `${storeName} storefront`,
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
        >
          Skip to content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
