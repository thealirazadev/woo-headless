import type { Category, Product, StockStatus } from '@/lib/types';
import type { WcCategory, WcProduct } from '@/lib/woocommerce/types';
import { sanitizeHtml } from '@/lib/format';

const PLACEHOLDER_IMAGE = { src: '/placeholder-product.svg', alt: '' };

const VALID_STOCK_STATUSES: StockStatus[] = ['instock', 'outofstock', 'onbackorder'];

function mapStockStatus(status: string | undefined): StockStatus {
  if (status && (VALID_STOCK_STATUSES as string[]).includes(status)) {
    return status as StockStatus;
  }
  return 'outofstock';
}

export function mapProduct(raw: WcProduct): Product {
  const images = (raw.images ?? [])
    .filter((img) => Boolean(img.src))
    .map((img) => ({ src: img.src as string, alt: img.alt || raw.name }));

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    permalink: raw.permalink ?? '',
    priceHtml: sanitizeHtml(raw.price_html ?? ''),
    price: raw.price ?? '0',
    regularPrice: raw.regular_price ?? raw.price ?? '0',
    salePrice: raw.sale_price ? raw.sale_price : null,
    onSale: Boolean(raw.on_sale),
    description: sanitizeHtml(raw.description ?? ''),
    shortDescription: sanitizeHtml(raw.short_description ?? ''),
    images: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
    stockStatus: mapStockStatus(raw.stock_status),
    purchasable: raw.purchasable ?? false,
    categories: (raw.categories ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  };
}

export function mapCategory(raw: WcCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    count: raw.count ?? 0,
    image: raw.image?.src ? { src: raw.image.src, alt: raw.image.alt || raw.name } : null,
    parent: raw.parent ?? 0,
  };
}
