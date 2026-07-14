# woo-headless

A headless storefront that presents an existing WooCommerce store's catalog through a fast, modern frontend. It reads products, categories, and product details from the WooCommerce REST API (wc/v3) in Next.js server components, renders listing, category, and product detail pages, keeps a client-side cart in the browser, and hands off to the WooCommerce store's own checkout when the shopper is ready to buy. The WooCommerce store remains the single source of truth; this app is a read-optimized presentation layer plus a local cart.

## Features

- Product listing page with pagination
- Category browsing (list of categories and per-category product listing)
- Product detail page with gallery image, price, description, and stock status
- Client-side cart (add, update quantity, remove, view totals) persisted to `localStorage`
- Checkout handoff that redirects to the WooCommerce store checkout with the cart contents
- Server-side data fetching with caching / ISR for catalog pages
- Optimized images via `next/image`
- Light and dark theme
- Loading skeletons, empty states, and friendly error fallbacks
- Accessible, keyboard-navigable UI

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- WooCommerce REST API (wc/v3) as the data source, fetched server-side
- `next/image` for images
- Zustand for client cart state, persisted to `localStorage`
- Vitest for unit/component tests, Playwright for a smoke test
- ESLint + Prettier

## Prerequisites

- Node.js 20.x or later
- A running WooCommerce store (WordPress + WooCommerce) reachable over HTTPS
- WooCommerce REST API keys (a read-only consumer key and consumer secret), created under WooCommerce > Settings > Advanced > REST API
- The store must have at least one published product and one category to see meaningful data

## Install

```
npm install
```

Copy the example environment file and fill in your store details:

```
cp .env.example .env.local
```

See `.env.example` for the required variables. `WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET` are server-only and must never be prefixed with `NEXT_PUBLIC_`.

## Run

Development server:

```
npm run dev
```

Production build:

```
npm run build
```

Start the production server (after a build):

```
npm run start
```

The dev server runs on `http://localhost:3000` by default.

## Test

Unit and component tests (Vitest):

```
npm run test
```

End-to-end smoke test (Playwright):

```
npm run test:e2e
```

Both the build and the test suite must pass before a feature is considered done. See `docs/testing.md` for details.

## Structure

```
woo-headless/
  app/            App Router routes (listing, categories, product detail, layout)
  components/     Reusable UI (product card, cart, buttons, skeletons, states)
  lib/            WooCommerce REST client, types, cart store, utils
  docs/           Planning and handoff documentation
  tests/          Vitest and Playwright tests
  public/         Static assets
  .env.example    Environment variable template
```

## License

MIT
