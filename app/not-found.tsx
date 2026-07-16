import type { ReactElement } from 'react';
import { Button } from '@/components/ui/Button';

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
