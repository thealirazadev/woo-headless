import { afterEach, describe, expect, it } from 'vitest';
import { getPublicEnv, getServerEnv } from '@/lib/env';

const KEYS = [
  'WOOCOMMERCE_STORE_URL',
  'WOOCOMMERCE_CONSUMER_KEY',
  'WOOCOMMERCE_CONSUMER_SECRET',
  'NEXT_PUBLIC_STORE_NAME',
] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

function setEnv(values: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) delete process.env[key];
  Object.assign(process.env, values);
}

describe('getServerEnv', () => {
  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  const keys = { WOOCOMMERCE_CONSUMER_KEY: 'ck_x', WOOCOMMERCE_CONSUMER_SECRET: 'cs_x' };

  it('returns the config and strips trailing slashes from the store URL', () => {
    setEnv({ WOOCOMMERCE_STORE_URL: 'https://store.example.com//', ...keys });
    expect(getServerEnv()).toEqual({
      storeUrl: 'https://store.example.com',
      consumerKey: 'ck_x',
      consumerSecret: 'cs_x',
    });
  });

  it('refuses a store URL that is not https, so keys never travel in clear text', () => {
    setEnv({ WOOCOMMERCE_STORE_URL: 'http://store.example.com', ...keys });
    expect(() => getServerEnv()).toThrow('must use https');
  });

  it('rejects a malformed store URL', () => {
    setEnv({ WOOCOMMERCE_STORE_URL: 'not a url', ...keys });
    expect(() => getServerEnv()).toThrow('not a valid URL');
  });

  it('names a missing variable', () => {
    setEnv({ WOOCOMMERCE_STORE_URL: 'https://store.example.com' });
    expect(() => getServerEnv()).toThrow('WOOCOMMERCE_CONSUMER_KEY');
  });

  it('falls back to a default public store name', () => {
    setEnv({});
    expect(getPublicEnv().storeName).toBe('Store');
  });
});
