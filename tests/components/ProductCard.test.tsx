import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';

const baseProduct: Product = {
  id: 1,
  slug: 'widget',
  name: 'Widget',
  permalink: 'https://store.example.com/product/widget',
  priceHtml: '',
  price: '9.99',
  regularPrice: '12.99',
  salePrice: '9.99',
  onSale: true,
  description: '',
  shortDescription: '',
  images: [{ src: '/w.jpg', alt: 'Widget photo' }],
  stockStatus: 'instock',
  purchasable: true,
  categories: [],
};

describe('ProductCard', () => {
  it('renders the product name and formatted price', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('links to the product detail page', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/widget');
  });

  it('shows an out-of-stock badge when the product is unavailable', () => {
    render(<ProductCard product={{ ...baseProduct, stockStatus: 'outofstock' }} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('clamps long titles to two lines without breaking the card layout', () => {
    const longTitle = 'A very long product title'.repeat(6);
    render(<ProductCard product={{ ...baseProduct, name: longTitle }} />);
    expect(screen.getByText(longTitle)).toHaveClass('line-clamp-2');
  });
});
