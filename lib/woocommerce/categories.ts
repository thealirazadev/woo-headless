import { wooGet, WooCommerceError } from '@/lib/woocommerce/client';
import { mapCategory } from '@/lib/woocommerce/map';
import type { WcCategory } from '@/lib/woocommerce/types';
import type { Category } from '@/lib/types';

const MAX_PER_PAGE = 100;

/** Fetches product categories. hideEmpty defaults to true for the categories index. */
export async function getCategories(hideEmpty = true): Promise<Category[]> {
  const { data } = await wooGet<WcCategory[]>('/products/categories', {
    per_page: MAX_PER_PAGE,
    hide_empty: hideEmpty,
  });
  return data.map(mapCategory);
}

/** Resolves a category by slug. Throws WooCommerceError(code: 'not_found') if no match. */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await wooGet<WcCategory[]>('/products/categories', { slug });
  const first = data[0];
  if (!first) {
    throw new WooCommerceError('Category not found', 404, 'not_found');
  }
  return mapCategory(first);
}
