import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Product } from '@/lib/types';

vi.mock('@/lib/woocommerce/products', () => ({
  getProducts: vi.fn(),
}));

import { getProducts } from '@/lib/woocommerce/products';
import HomePage from '@/app/page';

const product: Product = {
  id: 1,
  slug: 'red-shirt',
  name: 'Red Shirt',
  permalink: 'https://store.example.com/product/red-shirt',
  type: 'simple',
  priceHtml: '',
  price: '20',
  regularPrice: '20',
  salePrice: null,
  onSale: false,
  description: '',
  shortDescription: '',
  images: [{ src: '/r.jpg', alt: 'Red Shirt' }],
  stockStatus: 'instock',
  purchasable: true,
  categories: [],
};

function page(params: Record<string, string>) {
  return HomePage({ searchParams: Promise.resolve(params) });
}

describe('HomePage search', () => {
  beforeEach(() => {
    vi.mocked(getProducts).mockReset();
  });

  it('passes a trimmed search term to the products API and shows it as the heading', async () => {
    vi.mocked(getProducts).mockResolvedValue({
      items: [product],
      total: 1,
      totalPages: 1,
    });
    render(await page({ q: '  red  ' }));
    expect(getProducts).toHaveBeenCalledWith({ page: 1, search: 'red' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Results for \u201cred\u201d',
    );
    expect(screen.getByText('Red Shirt')).toBeInTheDocument();
  });

  it('shows a no-results state with a way back when nothing matches', async () => {
    vi.mocked(getProducts).mockResolvedValue({ items: [], total: 0, totalPages: 0 });
    render(await page({ q: 'zzz' }));
    expect(screen.getByText('No matching products')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('lists the whole catalog when the search term is blank', async () => {
    vi.mocked(getProducts).mockResolvedValue({
      items: [product],
      total: 1,
      totalPages: 1,
    });
    render(await page({ q: '   ' }));
    expect(getProducts).toHaveBeenCalledWith({ page: 1, search: undefined });
  });

  it('caps a very long search term', async () => {
    vi.mocked(getProducts).mockResolvedValue({ items: [], total: 0, totalPages: 0 });
    render(await page({ q: 'x'.repeat(500) }));
    expect(vi.mocked(getProducts).mock.calls[0]?.[0]?.search).toHaveLength(100);
  });
});
