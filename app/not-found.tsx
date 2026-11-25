import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { Button } from '@/components/ui/Button';

// Next already adds a noindex robots tag when notFound() fires; declaring it here keeps
// the global 404 out of search indexes even if that default changes.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/** Global 404 page. */
export default function NotFound(): ReactElement {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-lg font-semibold text-fg">Page not found</h1>
      <p className="text-sm text-fg-muted">We couldn&apos;t find what you were looking for.</p>
      <Button href="/">Back to home</Button>
    </div>
  );
}
