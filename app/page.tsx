import type { ReactElement } from 'react';
import { getPublicEnv } from '@/lib/env';
import { getProducts } from '@/lib/woocommerce/products';
import { parsePageParam } from '@/lib/pagination';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

export const revalidate = 60;

const MAX_QUERY_LENGTH = 100;

interface HomePageProps {
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}

export default async function HomePage({
  searchParams,
}: HomePageProps): Promise<ReactElement> {
  const { storeName } = getPublicEnv();
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (rawQuery ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  const search = query || undefined;

  let { items, totalPages } = await getProducts({ page: requestedPage, search });
  if (items.length === 0 && totalPages > 0 && requestedPage > totalPages) {
    // Requested page is past the end (e.g. a stale bookmark) - fall back to the last real page
    // instead of showing an empty state for a catalog that isn't actually empty.
    ({ items, totalPages } = await getProducts({ page: totalPages, search }));
  }
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">
        {query ? `Results for “${query}”` : storeName}
      </h1>
      {items.length === 0 ? (
        <div className="mt-8">
          {query ? (
            <EmptyState
              heading="No matching products"
              message="Try a different search term."
              action={<Button href="/">Browse all products</Button>}
            />
          ) : (
            <EmptyState
              heading="No products yet"
              message="This store has no published products."
            />
          )}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ProductGrid products={items} />
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath={query ? `/?q=${encodeURIComponent(query)}` : '/'}
          />
        </>
      )}
    </div>
  );
}
