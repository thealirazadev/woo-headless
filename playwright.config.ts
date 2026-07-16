import { defineConfig, devices } from '@playwright/test';

const APP_PORT = 3100;
const MOCK_STORE_URL = 'https://127.0.0.1:8443';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${APP_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node tests/e2e/mock-store-server.mjs',
      port: 8443,
      timeout: 20_000,
      reuseExistingServer: false,
    },
    {
      // A production build avoids next dev's filesystem watcher (which can exhaust
      // inotify watches in constrained environments) and matches how docs/testing.md
      // describes running the app for e2e verification.
      command: `npm run build && npm run start -- -p ${APP_PORT}`,
      port: APP_PORT,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        WOOCOMMERCE_STORE_URL: MOCK_STORE_URL,
        WOOCOMMERCE_CONSUMER_KEY: 'ck_test0000000000000000000000000000000000',
        WOOCOMMERCE_CONSUMER_SECRET: 'cs_test0000000000000000000000000000000000',
        NEXT_PUBLIC_STORE_NAME: 'Test Store',
        // The mock store above uses a throwaway self-signed cert; only trust it for
        // this test run, never in production.
        NODE_TLS_REJECT_UNAUTHORIZED: '0',
      },
    },
  ],
});
