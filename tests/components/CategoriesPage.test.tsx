import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Category } from '@/lib/types';

vi.mock('@/lib/woocommerce/categories', () => ({
  getCategories: vi.fn(),
}));

import { getCategories } from '@/lib/woocommerce/categories';
import CategoriesPage from '@/app/category/page';

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.mocked(getCategories).mockReset();
  });

  it('renders categories with counts and links', async () => {
    const categories: Category[] = [
      { id: 1, name: 'Widgets', slug: 'widgets', count: 3, image: null, parent: 0 },
    ];
    vi.mocked(getCategories).mockResolvedValue(categories);

    render(await CategoriesPage());

    expect(screen.getByRole('link', { name: /Widgets/ })).toHaveAttribute('href', '/category/widgets');
    expect(screen.getByText('3 products')).toBeInTheDocument();
  });

  it('shows an empty state when there are no categories', async () => {
    vi.mocked(getCategories).mockResolvedValue([]);
    render(await CategoriesPage());
    expect(screen.getByText('No categories yet')).toBeInTheDocument();
  });
});
