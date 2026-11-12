import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';

const baseProduct: Product = {
  id: 1,
  slug: 'widget',
  name: 'Widget',
  permalink: 'https://store.example.com/product/widget',
  type: 'simple',
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

  it('shows an out-of-stock badge and disables add-to-cart when unavailable', () => {
    render(<ProductCard product={{ ...baseProduct, stockStatus: 'outofstock' }} />);
    expect(screen.getAllByText('Out of stock')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
  });

  it('renders an enabled add-to-cart button when in stock', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  });

  it('disables add-to-cart for a product the store will not sell', () => {
    render(<ProductCard product={{ ...baseProduct, purchasable: false }} />);
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  });

  it('links a variable product to the store to choose options instead of adding it', () => {
    render(<ProductCard product={{ ...baseProduct, type: 'variable' }} />);
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose options' })).toHaveAttribute(
      'href',
      'https://store.example.com/product/widget',
    );
  });

  it('shows a "From" price for a variable product', () => {
    render(<ProductCard product={{ ...baseProduct, type: 'variable', price: '60' }} />);
    expect(screen.getByText('From $60.00')).toBeInTheDocument();
  });

  it('clamps long titles to two lines without breaking the card layout', () => {
    const longTitle = 'A very long product title'.repeat(6);
    render(<ProductCard product={{ ...baseProduct, name: longTitle }} />);
    expect(screen.getByText(longTitle)).toHaveClass('line-clamp-2');
  });
});
