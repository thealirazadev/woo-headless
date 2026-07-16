import Link from 'next/link';
import type { ReactElement } from 'react';
import { getCategories } from '@/lib/woocommerce/categories';
import { EmptyState } from '@/components/ui/EmptyState';

export const revalidate = 60;
// No dynamic segment or search params on this route, so Next would otherwise try to
// statically prerender it at build time (requiring the store to be reachable during
// `next build`). Force on-demand rendering; the underlying fetch still caches per
// `revalidate` above.
export const dynamic = 'force-dynamic';

/** Categories index. Empty categories are hidden by `getCategories()`'s default. */
export default async function CategoriesPage(): Promise<ReactElement> {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">Categories</h1>
      {categories.length === 0 ? (
        <div className="mt-8">
          <EmptyState heading="No categories yet" message="This store has no product categories." />
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="flex flex-col gap-1 rounded-md border border-border bg-surface p-4
                  shadow-sm transition-shadow hover:shadow-md focus-visible:outline
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <span className="text-base font-semibold text-fg">{category.name}</span>
                <span className="text-sm text-fg-muted">{category.count} products</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
