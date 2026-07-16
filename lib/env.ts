/**
 * Validated, server-only access to environment variables. Never import this
 * module from a client component: it is the boundary that guards the
 * WooCommerce consumer key/secret from ever reaching the browser.
 */

class EnvError extends Error {}

function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new EnvError(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertHttps(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new EnvError('WOOCOMMERCE_STORE_URL is not a valid URL');
  }
  if (parsed.protocol !== 'https:') {
    throw new EnvError('WOOCOMMERCE_STORE_URL must use https');
  }
  return url.replace(/\/+$/, '');
}

/** Server-only config. Only ever call this from server components / route handlers / lib code. */
export function getServerEnv(): {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
} {
  const storeUrl = assertHttps(requireServerEnv('WOOCOMMERCE_STORE_URL'));
  const consumerKey = requireServerEnv('WOOCOMMERCE_CONSUMER_KEY');
  const consumerSecret = requireServerEnv('WOOCOMMERCE_CONSUMER_SECRET');
  return { storeUrl, consumerKey, consumerSecret };
}

/** Public config, safe to read from client components. */
export function getPublicEnv(): { storeName: string } {
  return { storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Store' };
}

export { EnvError };
