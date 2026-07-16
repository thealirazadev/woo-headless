import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WooCommerceError } from '@/lib/woocommerce/client';
import type { Product } from '@/lib/types';

vi.mock('@/lib/woocommerce/products', () => ({
  getProductBySlug: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  notFound: (): never => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import { getProductBySlug } from '@/lib/woocommerce/products';
import ProductPage from '@/app/product/[slug]/page';

const product: Product = {
  id: 1,
  slug: 'widget',
  name: 'Widget',
  permalink: 'https://store.example.com/product/widget',
  priceHtml: '',
  price: '9.99',
  regularPrice: '9.99',
  salePrice: null,
  onSale: false,
  description: '<p>Great widget</p>',
  shortDescription: '',
  images: [{ src: '/w.jpg', alt: 'Widget photo' }],
  stockStatus: 'instock',
  purchasable: true,
  categories: [],
};

describe('ProductPage', () => {
  beforeEach(() => {
    vi.mocked(getProductBySlug).mockReset();
  });

  it('renders product name, price, and description for a valid slug', async () => {
    vi.mocked(getProductBySlug).mockResolvedValue(product);
    const element = await ProductPage({ params: Promise.resolve({ slug: 'widget' }) });
    render(element);
    expect(screen.getByRole('heading', { name: 'Widget' })).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('Great widget')).toBeInTheDocument();
  });

  it('calls notFound when the product does not exist', async () => {
    vi.mocked(getProductBySlug).mockRejectedValue(
      new WooCommerceError('Product not found', 404, 'not_found'),
    );
    await expect(
      ProductPage({ params: Promise.resolve({ slug: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound for a malformed slug without hitting the API', async () => {
    await expect(
      ProductPage({ params: Promise.resolve({ slug: 'Not Valid!' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(getProductBySlug).not.toHaveBeenCalled();
  });
});
