import type { ReactElement } from 'react';

interface SkeletonProps {
  className?: string;
}

/** Loading placeholder. Callers size it (via className) to match the real element's footprint. */
export function Skeleton({ className = '' }: SkeletonProps): ReactElement {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-surface-2 ${className}`.trim()} />;
}
