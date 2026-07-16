import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import type { Product } from '@/lib/types';
import { Price } from '@/components/ui/Price';

interface ProductCardProps {
  product: Product;
}

/** Server-renderable catalog card: image, name, price, linking to the product detail page. */
export function ProductCard({ product }: ProductCardProps): ReactElement {
  const image = product.images[0] ?? { src: '/placeholder-product.svg', alt: product.name };
  const outOfStock = product.stockStatus === 'outofstock';

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface
        shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={`object-cover transition-transform duration-150 group-hover:scale-[1.02] ${
            outOfStock ? 'opacity-70' : ''
          }`}
        />
        {outOfStock ? (
          <span className="absolute left-2 top-2 rounded-sm bg-danger px-2 py-0.5 text-xs font-semibold text-accent-fg">
            Out of stock
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-fg">{product.name}</h3>
        <div className="mt-auto">
          <Price price={product.price} regularPrice={product.regularPrice} onSale={product.onSale} />
        </div>
      </div>
    </Link>
  );
}
