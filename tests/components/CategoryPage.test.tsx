import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WooCommerceError } from '@/lib/woocommerce/client';
import type { Category, Product } from '@/lib/types';

vi.mock('@/lib/woocommerce/categories', () => ({
  getCategoryBySlug: vi.fn(),
}));
vi.mock('@/lib/woocommerce/products', () => ({
  getProducts: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  notFound: (): never => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import { getCategoryBySlug } from '@/lib/woocommerce/categories';
import { getProducts } from '@/lib/woocommerce/products';
import CategoryPage from '@/app/category/[slug]/page';

const category: Category = {
  id: 5,
  name: 'Widgets',
  slug: 'widgets',
  count: 2,
  image: null,
  parent: 0,
};

const product: Product = {
  id: 1,
  slug: 'widget',
  name: 'Widget',
  permalink: '',
  priceHtml: '',
  price: '9.99',
  regularPrice: '9.99',
  salePrice: null,
  onSale: false,
  description: '',
  shortDescription: '',
  images: [{ src: '/w.jpg', alt: 'Widget photo' }],
  stockStatus: 'instock',
  purchasable: true,
  categories: [],
};

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.mocked(getCategoryBySlug).mockReset();
    vi.mocked(getProducts).mockReset();
  });

  it('renders products for a valid category', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(category);
    vi.mocked(getProducts).mockResolvedValue({ items: [product], total: 1, totalPages: 1 });

    const element = await CategoryPage({
      params: Promise.resolve({ slug: 'widgets' }),
      searchParams: Promise.resolve({}),
    });
    render(element);

    expect(screen.getByRole('heading', { name: 'Widgets' })).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledWith({ page: 1, category: 5 });
  });

  it('shows the empty-category state when there are no products', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(category);
    vi.mocked(getProducts).mockResolvedValue({ items: [], total: 0, totalPages: 0 });

    const element = await CategoryPage({
      params: Promise.resolve({ slug: 'widgets' }),
      searchParams: Promise.resolve({}),
    });
    render(element);

    expect(screen.getByText('Nothing in this category')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute('href', '/');
  });

  it('calls notFound for an unknown category slug', async () => {
    vi.mocked(getCategoryBySlug).mockRejectedValue(
      new WooCommerceError('Category not found', 404, 'not_found'),
    );

    await expect(
      CategoryPage({
        params: Promise.resolve({ slug: 'unknown' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound for a malformed slug without hitting the API', async () => {
    await expect(
      CategoryPage({
        params: Promise.resolve({ slug: 'Not Valid!' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(getCategoryBySlug).not.toHaveBeenCalled();
  });
});
