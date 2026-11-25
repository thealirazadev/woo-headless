import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WooCommerceError } from '@/lib/woocommerce/client';
import type { Category } from '@/lib/types';

vi.mock('@/lib/woocommerce/categories', () => ({
  getCategoryBySlug: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  notFound: (): never => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import { getCategoryBySlug } from '@/lib/woocommerce/categories';
import CategoryLayout from '@/app/category/[slug]/layout';

const category: Category = {
  id: 5,
  name: 'Widgets',
  slug: 'widgets',
  count: 2,
  image: null,
  parent: 0,
};

describe('CategoryLayout', () => {
  beforeEach(() => {
    vi.mocked(getCategoryBySlug).mockReset();
  });

  it('renders the page for a category that exists', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(category);
    const element = await CategoryLayout({
      params: Promise.resolve({ slug: 'widgets' }),
      children: <p>category page</p>,
    });
    render(element);
    expect(screen.getByText('category page')).toBeInTheDocument();
    expect(getCategoryBySlug).toHaveBeenCalledWith('widgets');
  });

  it('calls notFound before the page renders for an unknown category', async () => {
    vi.mocked(getCategoryBySlug).mockRejectedValue(
      new WooCommerceError('Category not found', 404, 'not_found'),
    );
    await expect(
      CategoryLayout({
        params: Promise.resolve({ slug: 'unknown' }),
        children: <p>category page</p>,
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound for a malformed slug without hitting the API', async () => {
    await expect(
      CategoryLayout({
        params: Promise.resolve({ slug: 'Not Valid!' }),
        children: <p>category page</p>,
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(getCategoryBySlug).not.toHaveBeenCalled();
  });

  it('lets store outages reach the error boundary instead of a 404', async () => {
    vi.mocked(getCategoryBySlug).mockRejectedValue(
      new WooCommerceError('WooCommerce is temporarily unavailable', 503, 'retryable'),
    );
    await expect(
      CategoryLayout({
        params: Promise.resolve({ slug: 'widgets' }),
        children: <p>category page</p>,
      }),
    ).rejects.toThrow('WooCommerce is temporarily unavailable');
  });
});
