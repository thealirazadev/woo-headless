/** Raw shapes returned by the WooCommerce REST API (wc/v3). Deliberately partial:
 * only fields the app reads are declared, and all are optional except the ones
 * the mapper truly cannot function without (id, slug, name). */

export interface WcImage {
  id?: number;
  src?: string;
  alt?: string;
  name?: string;
}

export interface WcCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface WcProduct {
  id: number;
  slug: string;
  name: string;
  permalink?: string;
  type?: string;
  status?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  price_html?: string;
  description?: string;
  short_description?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  purchasable?: boolean;
  images?: WcImage[];
  categories?: WcCategoryRef[];
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  parent?: number;
  count?: number;
  image?: { src?: string; alt?: string } | null;
}
