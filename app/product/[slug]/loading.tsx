import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

/** Product detail skeleton: image block, title, price, description lines, and a button block. */
export default function Loading(): ReactElement {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
