# Testing: woo-headless

Build and tests must pass before any feature is marked done. Keep tests fast and focused on the parts most likely to break: the WooCommerce-to-domain mapping, cart math, checkout URL construction, and the critical browse-to-cart flow.

## Strategy

### Unit and component tests — Vitest
Use Vitest (+ React Testing Library + jsdom for components). Cover:

- **Mappers (`lib/woocommerce/map.ts`):** raw `WcProduct`/`WcCategory` -> `Product`/`Category`, including missing images (placeholder), missing sale price, and stock status mapping.
- **Client error mapping (`lib/woocommerce/client.ts`):** timeout -> `code: 'timeout'`; `401/403` -> misconfiguration; `404` surfaced for `notFound()`; `429/5xx` -> retryable. Mock `fetch`; assert no secret is written into logged output.
- **Cart store (`lib/cart/store.ts`) and selectors:** add/update/remove/clear; quantity clamping (integer, min 1); subtotal and item count math; persistence key.
- **Checkout URL (`lib/cart/checkout.ts`):** correct base + items; no consumer key/secret in the URL.
- **Components:** `ProductCard` (renders name/price, long-title clamp, out-of-stock disables add), `Pagination` (page bounds), `EmptyState` variants, `Button` states (disabled/loading `aria` attributes).

Guidelines: no live network in unit tests — mock the WooCommerce client/`fetch`. Keep component tests focused on behavior and accessibility (roles, labels), not styling.

### End-to-end — Playwright (one smoke test)
A single Playwright smoke test for the critical path, plus an unhappy-path assertion. Catalog data is fetched in server components, so browser-side route interception cannot mock it. Instead `playwright.config.ts` starts `tests/e2e/mock-store-server.mjs`, a small HTTPS mock of the WooCommerce REST API on port 8443 with a throwaway self-signed certificate, and then runs the app with `npm run build && npm run start` on port 3100 pointed at it. `NODE_TLS_REJECT_UNAUTHORIZED=0` is set only for that app server process. No live store credentials are needed.

Smoke flow:
1. Load the home listing; assert product cards render.
2. Open a product detail page; assert name and price.
3. Add to cart; assert the cart count badge increments.
4. Open the cart; assert the line item and subtotal.
5. Assert the checkout link points at the store checkout and carries no consumer key or secret (do not follow the external redirect).

Unhappy path asserted: an unknown product slug shows the not-found page.

Manual QA covers the rest of the unhappy-path matrix: store down, invalid credentials, slow network (skeletons), empty catalog, and very long titles. The automated e2e test guards the happy path against regressions.

## Exact commands

```
# Install (exact pinned versions; commit package-lock.json)
npm install

# Lint
npm run lint

# Unit + component tests (Vitest, single run)
npm run test

# Same, with the coverage gate on lib/ (what CI runs)
npm run test:coverage

# Vitest watch (local dev)
npm run test:watch

# End-to-end smoke test (Playwright)
npm run test:e2e

# Production build (must succeed before a feature is done)
npm run build

# Start built app (for manual verification / e2e against a prod build)
npm run start
```

`package.json` scripts:

```
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request targeting `main`, as a matrix over Node.js 20 and 22 on Ubuntu. Placeholder `WOOCOMMERCE_*` and `NEXT_PUBLIC_STORE_NAME` values are set in the job environment because the build reads them. Steps:

1. `npm ci`
2. `npm run lint`
3. `npm run test:coverage` (Vitest with the coverage thresholds on `lib/`: 90% lines and statements, 85% functions, 80% branches)
4. `npm run build`

The Playwright smoke test is not part of CI; run it locally.

## Before merging

All of the following should succeed locally:

- `npm run lint`: no errors.
- `npm run test:coverage`: all Vitest tests pass and the coverage gate holds.
- `npm run build`: succeeds.
- `npm run test:e2e`: the Playwright smoke test passes.
