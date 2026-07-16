/** Internal domain types, mapped from raw WooCommerce responses in lib/woocommerce/map.ts. */

export interface ProductImage {
  src: string;
  alt: string;
}

export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';

export interface ProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  priceHtml: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  stockStatus: StockStatus;
  purchasable: boolean;
  categories: ProductCategoryRef[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: { src: string; alt: string } | null;
  parent: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  totalPages: number;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  priceAtAdd: string;
  image: { src: string; alt: string } | null;
  quantity: number;
}
