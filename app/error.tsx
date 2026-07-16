'use client';

import type { ReactElement } from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  reset: () => void;
}

/** Friendly error fallback. No technical detail: the failure is already logged server-side. */
export default function Error({ reset }: ErrorPageProps): ReactElement {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-lg font-semibold text-fg">Something went wrong</h1>
      <p className="text-sm text-fg-muted">We couldn&apos;t load this right now. Please try again.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
