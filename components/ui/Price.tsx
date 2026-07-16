import type { ReactElement } from 'react';
import { formatPrice } from '@/lib/format';

interface PriceProps {
  price: string;
  regularPrice?: string;
  onSale?: boolean;
  className?: string;
}

/** Renders the current price, plus a struck-through regular price when the item is on sale. */
export function Price({ price, regularPrice, onSale, className = '' }: PriceProps): ReactElement {
  const showRegular = onSale && regularPrice && regularPrice !== price;

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`.trim()}>
      <span className="text-base font-bold tabular-nums text-fg">{formatPrice(price)}</span>
      {showRegular ? (
        <span className="text-sm tabular-nums text-fg-muted line-through">
          {formatPrice(regularPrice)}
        </span>
      ) : null}
    </span>
  );
}
