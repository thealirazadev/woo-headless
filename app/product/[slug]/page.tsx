import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { getPublicEnv } from '@/lib/env';
import { getProductBySlug } from '@/lib/woocommerce/products';
import { WooCommerceError } from '@/lib/woocommerce/client';
import { isValidSlug } from '@/lib/slug';
import type { Product } from '@/lib/types';
import { Price } from '@/components/ui/Price';
import { StockBadge } from '@/components/product/StockBadge';
import { AddToCartButton } from '@/components/product/AddToCartButton';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string): Promise<Product | null> {
  try {
    return await getProductBySlug(slug);
  } catch (err) {
    if (err instanceof WooCommerceError && err.code === 'not_found') {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { storeName } = getPublicEnv();
  const { slug } = await params;
  if (!isValidSlug(slug)) return { title: storeName };

  const product = await loadProduct(slug);
  return { title: product ? `${product.name} | ${storeName}` : storeName };
}

export default async function ProductPage({ params }: ProductPageProps): Promise<ReactElement> {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const product = await loadProduct(slug);
  if (!product) notFound();

  const image = product.images[0] ?? { src: '/placeholder-product.svg', alt: product.name };
  const outOfStock = product.stockStatus === 'outofstock';

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-surface-2">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className={`object-cover ${outOfStock ? 'opacity-70' : ''}`}
        />
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-fg">{product.name}</h1>
        <Price price={product.price} regularPrice={product.regularPrice} onSale={product.onSale} />
        <StockBadge status={product.stockStatus} />
        <div
          className="prose prose-sm max-w-none text-fg-muted"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <div>
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            image={image}
            disabled={outOfStock}
          />
        </div>
      </div>
    </div>
  );
}
