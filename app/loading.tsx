import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

/** Listing skeleton: matches the final grid footprint so there is no layout shift. */
export default function Loading(): ReactElement {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
