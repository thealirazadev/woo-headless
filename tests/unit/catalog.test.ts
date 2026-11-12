import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WcCategory, WcProduct } from '@/lib/woocommerce/types';

vi.mock('@/lib/woocommerce/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/woocommerce/client')>();
  return { ...actual, wooGet: vi.fn() };
});

import { wooGet, WooCommerceError } from '@/lib/woocommerce/client';
import { getProductBySlug, getProducts } from '@/lib/woocommerce/products';
import { getCategories, getCategoryBySlug } from '@/lib/woocommerce/categories';

const rawProduct: WcProduct = {
  id: 7,
  slug: 'mug',
  name: 'Mug',
  price: '8',
  purchasable: true,
};
const rawCategory: WcCategory = { id: 3, name: 'Mugs', slug: 'mugs', count: 1 };

function respond(data: unknown, total = 1, totalPages = 1) {
  vi.mocked(wooGet).mockResolvedValue({ data, total, totalPages } as never);
}

describe('getProducts', () => {
  beforeEach(() => vi.mocked(wooGet).mockReset());

  it('requests published products and maps them with pagination totals', async () => {
    respond([rawProduct], 30, 3);
    const result = await getProducts({ page: 2, category: 4, search: 'mug' });
    expect(wooGet).toHaveBeenCalledWith('/products', {
      page: 2,
      per_page: 12,
      status: 'publish',
      category: 4,
      search: 'mug',
    });
    expect(result.total).toBe(30);
    expect(result.totalPages).toBe(3);
    expect(result.items[0]?.name).toBe('Mug');
  });

  it('clamps the page and page size to the allowed range', async () => {
    respond([]);
    await getProducts({ page: -3, perPage: 500 });
    expect(wooGet).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ page: 1, per_page: 24 }),
    );
  });
});

describe('getProductBySlug', () => {
  beforeEach(() => vi.mocked(wooGet).mockReset());

  it('returns the first published match', async () => {
    respond([rawProduct]);
    await expect(getProductBySlug('mug')).resolves.toMatchObject({ id: 7, slug: 'mug' });
    expect(wooGet).toHaveBeenCalledWith('/products', { slug: 'mug', status: 'publish' });
  });

  it('throws not_found when nothing matches', async () => {
    respond([]);
    const error = await getProductBySlug('gone').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(WooCommerceError);
    expect((error as WooCommerceError).code).toBe('not_found');
  });
});

describe('categories', () => {
  beforeEach(() => vi.mocked(wooGet).mockReset());

  it('hides empty categories by default', async () => {
    respond([rawCategory]);
    const categories = await getCategories();
    expect(wooGet).toHaveBeenCalledWith('/products/categories', {
      per_page: 100,
      hide_empty: true,
    });
    expect(categories[0]?.name).toBe('Mugs');
  });

  it('resolves a category by slug and throws not_found when missing', async () => {
    respond([rawCategory]);
    await expect(getCategoryBySlug('mugs')).resolves.toMatchObject({ id: 3 });
    respond([]);
    const error = await getCategoryBySlug('nope').catch((e: unknown) => e);
    expect((error as WooCommerceError).code).toBe('not_found');
  });
});
