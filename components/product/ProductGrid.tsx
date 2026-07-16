import type { ReactElement } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductGridProps {
  products: Product[];
}

/** Responsive grid of product cards: 2 cols mobile, 3 tablet, 4 desktop. */
export function ProductGrid({ products }: ProductGridProps): ReactElement {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
