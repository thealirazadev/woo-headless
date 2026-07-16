import { describe, expect, it } from 'vitest';
import { mapCategory, mapProduct } from '@/lib/woocommerce/map';
import type { WcCategory, WcProduct } from '@/lib/woocommerce/types';

const baseProduct: WcProduct = {
  id: 1,
  slug: 'widget',
  name: 'Widget',
  permalink: 'https://store.example.com/product/widget',
  price: '9.99',
  regular_price: '12.99',
  sale_price: '9.99',
  on_sale: true,
  price_html: '<span class="amount">$9.99</span>',
  description: '<p>Great widget</p><script>alert(1)</script>',
  short_description: '<p>Short</p>',
  stock_status: 'instock',
  purchasable: true,
  images: [{ id: 1, src: 'https://store.example.com/w.jpg', alt: 'Widget photo' }],
  categories: [{ id: 5, name: 'Widgets', slug: 'widgets' }],
};

describe('mapProduct', () => {
  it('maps core fields', () => {
    const product = mapProduct(baseProduct);
    expect(product.id).toBe(1);
    expect(product.slug).toBe('widget');
    expect(product.onSale).toBe(true);
    expect(product.salePrice).toBe('9.99');
    expect(product.categories).toEqual([{ id: 5, name: 'Widgets', slug: 'widgets' }]);
  });

  it('strips script tags from description', () => {
    const product = mapProduct(baseProduct);
    expect(product.description).not.toContain('<script>');
    expect(product.description).toContain('Great widget');
  });

  it('falls back to a placeholder image when images are missing', () => {
    const product = mapProduct({ ...baseProduct, images: [] });
    expect(product.images).toHaveLength(1);
    expect(product.images[0]?.src).toBe('/placeholder-product.svg');
  });

  it('defaults sale price to null when absent', () => {
    const product = mapProduct({ ...baseProduct, sale_price: undefined, on_sale: false });
    expect(product.salePrice).toBeNull();
  });

  it('maps an unrecognized stock status to outofstock', () => {
    const product = mapProduct({ ...baseProduct, stock_status: 'bogus' });
    expect(product.stockStatus).toBe('outofstock');
  });
});

const baseCategory: WcCategory = {
  id: 5,
  name: 'Widgets',
  slug: 'widgets',
  parent: 0,
  count: 3,
  image: { src: 'https://store.example.com/cat.jpg', alt: 'Widgets' },
};

describe('mapCategory', () => {
  it('maps core fields', () => {
    const category = mapCategory(baseCategory);
    expect(category).toEqual({
      id: 5,
      name: 'Widgets',
      slug: 'widgets',
      count: 3,
      parent: 0,
      image: { src: 'https://store.example.com/cat.jpg', alt: 'Widgets' },
    });
  });

  it('maps a missing image to null', () => {
    const category = mapCategory({ ...baseCategory, image: null });
    expect(category.image).toBeNull();
  });
});
