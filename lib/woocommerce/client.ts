import { getServerEnv } from '@/lib/env';
import { logger, redactUrl } from '@/lib/logger';

const TIMEOUT_MS = 8000;

export type WooCommerceErrorCode =
  | 'timeout'
  | 'network'
  | 'misconfiguration'
  | 'not_found'
  | 'retryable'
  | 'unknown';

export class WooCommerceError extends Error {
  status: number | null;
  code: WooCommerceErrorCode;

  constructor(message: string, status: number | null, code: WooCommerceErrorCode) {
    super(message);
    this.name = 'WooCommerceError';
    this.status = status;
    this.code = code;
  }
}

interface RequestResult<T> {
  data: T;
  total: number;
  totalPages: number;
}

/**
 * Performs an authenticated GET against the WooCommerce REST API (wc/v3).
 * Server-only: reads the consumer key/secret via lib/env.ts and sends them
 * as a Basic auth header so they are never written into a loggable URL.
 */
export async function wooGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<RequestResult<T>> {
  const { storeUrl, consumerKey, consumerSecret } = getServerEnv();
  const url = new URL(`${storeUrl}/wp-json/wc/v3${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();
  const loggablePath = redactUrl(url.toString());

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    if (err instanceof Error && err.name === 'AbortError') {
      logger.error({ event: 'woocommerce_request', code: 'timeout', durationMs, path: loggablePath });
      throw new WooCommerceError('Request to WooCommerce timed out', null, 'timeout');
    }
    logger.error({
      event: 'woocommerce_request',
      code: 'network',
      durationMs,
      path: loggablePath,
      message: err instanceof Error ? err.message : 'unknown network error',
    });
    throw new WooCommerceError('Could not reach WooCommerce', null, 'network');
  } finally {
    clearTimeout(timeout);
  }

  const durationMs = Date.now() - startedAt;

  if (response.status === 401 || response.status === 403) {
    logger.error({
      event: 'woocommerce_request',
      code: 'misconfiguration',
      status: response.status,
      durationMs,
      path: loggablePath,
    });
    throw new WooCommerceError('WooCommerce rejected the request credentials', response.status, 'misconfiguration');
  }

  if (response.status === 404) {
    logger.warn({ event: 'woocommerce_request', status: 404, durationMs, path: loggablePath });
    throw new WooCommerceError('Resource not found', 404, 'not_found');
  }

  if (response.status === 429 || response.status >= 500) {
    logger.warn({
      event: 'woocommerce_request',
      code: 'retryable',
      status: response.status,
      durationMs,
      path: loggablePath,
    });
    throw new WooCommerceError('WooCommerce is temporarily unavailable', response.status, 'retryable');
  }

  if (!response.ok) {
    logger.error({
      event: 'woocommerce_request',
      code: 'unknown',
      status: response.status,
      durationMs,
      path: loggablePath,
    });
    throw new WooCommerceError('Unexpected WooCommerce response', response.status, 'unknown');
  }

  const data = (await response.json()) as T;
  const total = Number(response.headers.get('X-WP-Total') ?? 0);
  const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 0);

  logger.info({ event: 'woocommerce_request', status: response.status, durationMs, path: loggablePath });

  return { data, total, totalPages };
}
