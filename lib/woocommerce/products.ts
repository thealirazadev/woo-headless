import { wooGet, WooCommerceError } from '@/lib/woocommerce/client';
import { mapProduct } from '@/lib/woocommerce/map';
import type { WcProduct } from '@/lib/woocommerce/types';
import type { Paginated, Product } from '@/lib/types';

const MAX_PER_PAGE = 24;
const DEFAULT_PER_PAGE = 12;

export interface GetProductsOptions {
  page?: number;
  perPage?: number;
  category?: number;
  search?: string;
}

/** Fetches a page of published products, mapped to the app's domain type. */
export async function getProducts(options: GetProductsOptions = {}): Promise<Paginated<Product>> {
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Math.floor(options.perPage ?? DEFAULT_PER_PAGE)));

  const { data, total, totalPages } = await wooGet<WcProduct[]>('/products', {
    page,
    per_page: perPage,
    status: 'publish',
    category: options.category,
    search: options.search,
  });

  return { items: data.map(mapProduct), total, totalPages };
}

/** Resolves a product by slug. Throws WooCommerceError(code: 'not_found') if no match. */
export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await wooGet<WcProduct[]>('/products', { slug, status: 'publish' });
  const first = data[0];
  if (!first) {
    throw new WooCommerceError('Product not found', 404, 'not_found');
  }
  return mapProduct(first);
}
