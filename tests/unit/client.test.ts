import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ENV = {
  WOOCOMMERCE_STORE_URL: 'https://store.example.com',
  WOOCOMMERCE_CONSUMER_KEY: 'ck_test',
  WOOCOMMERCE_CONSUMER_SECRET: 'cs_test',
};

function headers(map: Record<string, string>) {
  return { get: (key: string) => map[key] ?? null };
}

describe('wooGet', () => {
  beforeEach(() => {
    Object.assign(process.env, ENV);
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns data with pagination headers on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: headers({ 'X-WP-Total': '2', 'X-WP-TotalPages': '1' }),
      json: async () => [{ id: 1 }, { id: 2 }],
    });
    vi.stubGlobal('fetch', fetchMock);

    const { wooGet } = await import('@/lib/woocommerce/client');
    const result = await wooGet('/products');
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.data).toHaveLength(2);
  });

  it('never sends the consumer key/secret in the request URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: headers({}),
      json: async () => [],
    });
    vi.stubGlobal('fetch', fetchMock);

    const { wooGet } = await import('@/lib/woocommerce/client');
    await wooGet('/products');

    const [calledUrl, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(calledUrl.toString()).not.toContain('ck_test');
    expect(calledUrl.toString()).not.toContain('cs_test');
    expect((init.headers as Record<string, string>).Authorization).toContain('Basic ');
  });

  it('maps a fetch abort to a timeout WooCommerceError', async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });
    vi.stubGlobal('fetch', fetchMock);

    const { wooGet, WooCommerceError } = await import('@/lib/woocommerce/client');
    await expect(wooGet('/products')).rejects.toMatchObject({
      code: 'timeout',
    } satisfies Partial<InstanceType<typeof WooCommerceError>>);
  });

  it('maps 401 to a misconfiguration error without leaking detail', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: headers({}),
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { wooGet } = await import('@/lib/woocommerce/client');
    await expect(wooGet('/products')).rejects.toMatchObject({ code: 'misconfiguration', status: 401 });
  });

  it('maps 404 to a not_found error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: headers({}),
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { wooGet } = await import('@/lib/woocommerce/client');
    await expect(wooGet('/products/999')).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });

  it('maps 429 and 5xx to a retryable error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: headers({}),
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { wooGet } = await import('@/lib/woocommerce/client');
    await expect(wooGet('/products')).rejects.toMatchObject({ code: 'retryable', status: 503 });
  });

  it('does not log the consumer secret when a request fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: headers({}),
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { wooGet } = await import('@/lib/woocommerce/client');
    await expect(wooGet('/products')).rejects.toBeTruthy();

    const loggedText = [...errorSpy.mock.calls, ...warnSpy.mock.calls]
      .map((args) => JSON.stringify(args))
      .join(' ');
    expect(loggedText).not.toContain('cs_test');
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
