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
A single Playwright smoke test for the critical path, plus a couple of unhappy-path assertions. It runs against a local dev/build server. Prefer mocking WooCommerce responses (Playwright route interception) so the test is deterministic and does not require live store credentials in CI.

Smoke flow:
1. Load the home listing; assert product cards render.
2. Open a product detail page; assert name and price.
3. Add to cart; assert the cart count badge increments.
4. Open the cart; assert the line item and subtotal.
5. Assert the checkout button is enabled and points at the store checkout base (do not follow the external redirect).

Unhappy paths to include as assertions (via route mocking): empty catalog shows empty state; product 404 shows the 404 page.

Manual QA still covers the full unhappy-path matrix in `docs/phases.md` (API down, invalid credentials, slow network, long titles) each phase; the automated e2e test guards the happy path against regressions.

## Exact commands

```
# Install (exact pinned versions; commit package-lock.json)
npm install

# Lint
npm run lint

# Unit + component tests (Vitest, single run)
npm run test

# Vitest watch (local dev)
npm run test:watch

# End-to-end smoke test (Playwright)
npm run test:e2e

# Production build (must succeed before a feature is done)
npm run build

# Start built app (for manual verification / e2e against a prod build)
npm run start
```

Expected `package.json` scripts:

```
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

## Definition of "tests pass" for a feature

A feature/task is done only when all of the following succeed locally:

- `npm run lint` — no errors.
- `npm run build` — succeeds.
- `npm run test` — all Vitest tests pass.
- From Phase 7 on, `npm run test:e2e` — the Playwright smoke test passes.

Do not commit a feature that leaves any of these failing. If a fix is not working after two attempts, stop and report (see Boundaries in `docs/rules.md`).
