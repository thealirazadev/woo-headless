import { notFound } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';
import { getCategoryBySlug } from '@/lib/woocommerce/categories';
import { WooCommerceError } from '@/lib/woocommerce/client';
import { isValidSlug } from '@/lib/slug';

interface CategoryLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Resolves the category before this segment's loading.tsx boundary starts streaming,
 * so an unknown category answers with a real 404 status instead of a 200 that only
 * renders the not-found page. The page and generateMetadata repeat the lookup, which
 * the 60-second fetch data cache in lib/woocommerce/client.ts answers once warm.
 */
export default async function CategoryLayout({
  children,
  params,
}: CategoryLayoutProps): Promise<ReactElement> {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  try {
    await getCategoryBySlug(slug);
  } catch (err) {
    if (err instanceof WooCommerceError && err.code === 'not_found') notFound();
    throw err;
  }

  return <>{children}</>;
}
