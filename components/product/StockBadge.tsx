import type { ReactElement } from 'react';
import type { StockStatus } from '@/lib/types';

const LABELS: Record<StockStatus, string> = {
  instock: 'In stock',
  outofstock: 'Out of stock',
  onbackorder: 'On backorder',
};

const COLOR_CLASSES: Record<StockStatus, string> = {
  instock: 'bg-success/15 text-success',
  outofstock: 'bg-danger/15 text-danger',
  onbackorder: 'bg-warning/15 text-warning',
};

interface StockBadgeProps {
  status: StockStatus;
}

/** Renders the product's stock status as a small colored badge. */
export function StockBadge({ status }: StockBadgeProps): ReactElement {
  return (
    <span
      className={`inline-block w-fit rounded-sm px-2 py-1 text-xs font-semibold ${COLOR_CLASSES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
