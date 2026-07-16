import type { ReactElement } from 'react';
import { getPublicEnv } from '@/lib/env';
import { getProducts } from '@/lib/woocommerce/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';

export const revalidate = 60;

export default async function HomePage(): Promise<ReactElement> {
  const { storeName } = getPublicEnv();
  const { items } = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">{storeName}</h1>
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState heading="No products yet" message="This store has no published products." />
        </div>
      ) : (
        <div className="mt-6">
          <ProductGrid products={items} />
        </div>
      )}
    </div>
  );
}
