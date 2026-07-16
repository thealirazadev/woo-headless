import Link from 'next/link';
import type { ReactElement } from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

const LINK_CLASSES =
  'rounded-md border border-border px-3 py-2 text-sm font-medium text-fg transition-colors ' +
  'hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-focus-ring';

/** Prev/next pagination driven by the real `total`/`totalPages` from the WooCommerce response. */
export function Pagination({ page, totalPages, basePath }: PaginationProps): ReactElement | null {
  if (totalPages <= 1) return null;

  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
      <Link
        href={`${basePath}?page=${prevPage}`}
        aria-disabled={isFirst}
        className={`${LINK_CLASSES} ${isFirst ? 'pointer-events-none opacity-50' : ''}`}
      >
        Previous
      </Link>
      <span className="text-sm text-fg-muted">
        Page {page} of {totalPages}
      </span>
      <Link
        href={`${basePath}?page=${nextPage}`}
        aria-disabled={isLast}
        className={`${LINK_CLASSES} ${isLast ? 'pointer-events-none opacity-50' : ''}`}
      >
        Next
      </Link>
    </nav>
  );
}
