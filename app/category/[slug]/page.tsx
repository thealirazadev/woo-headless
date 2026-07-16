import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { getPublicEnv } from '@/lib/env';
import { getCategoryBySlug } from '@/lib/woocommerce/categories';
import { getProducts } from '@/lib/woocommerce/products';
import { WooCommerceError } from '@/lib/woocommerce/client';
import { isValidSlug } from '@/lib/slug';
import { parsePageParam } from '@/lib/pagination';
import type { Category } from '@/lib/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

async function loadCategory(slug: string): Promise<Category | null> {
  try {
    return await getCategoryBySlug(slug);
  } catch (err) {
    if (err instanceof WooCommerceError && err.code === 'not_found') {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { storeName } = getPublicEnv();
  const { slug } = await params;
  if (!isValidSlug(slug)) return { title: storeName };

  const category = await loadCategory(slug);
  return { title: category ? `${category.name} | ${storeName}` : storeName };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps): Promise<ReactElement> {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const category = await loadCategory(slug);
  if (!category) notFound();

  const requestedPage = parsePageParam((await searchParams).page);
  let { items, totalPages } = await getProducts({ page: requestedPage, category: category.id });
  if (items.length === 0 && totalPages > 0 && requestedPage > totalPages) {
    ({ items, totalPages } = await getProducts({ page: totalPages, category: category.id }));
  }
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">{category.name}</h1>
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            heading="Nothing in this category"
            message="Try browsing all products instead."
            action={<Button href="/">Browse all products</Button>}
          />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ProductGrid products={items} />
          </div>
          <Pagination page={page} totalPages={totalPages} basePath={`/category/${slug}`} />
        </>
      )}
    </div>
  );
}
