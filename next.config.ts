import type { NextConfig } from 'next';

const storeUrl = process.env.WOOCOMMERCE_STORE_URL;
const storeHostname = storeUrl ? new URL(storeUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // The store's own media host, so next/image can optimize product images.
      ...(storeHostname
        ? [{ protocol: 'https' as const, hostname: storeHostname }]
        : []),
      // WooCommerce/WordPress installs commonly serve media from this subdomain too.
      { protocol: 'https' as const, hostname: '*.wp.com' },
    ],
  },
};

export default nextConfig;
