# PRD: woo-headless

## What we're building

A headless storefront for an existing WooCommerce store. The app reads the store's catalog (products and categories) from the WooCommerce REST API in Next.js server components and presents it through a fast, modern, accessible frontend. Shoppers browse products, filter by category, view product details, build a cart in the browser, and are then handed off to the WooCommerce store's own checkout to pay.

The WooCommerce store is the single source of truth. This project does not own inventory, pricing, orders, or payments. It owns presentation and the local cart only.

## Target user

- Primary: a shopper visiting the storefront to browse and buy. They expect fast page loads, clear product information, an obvious cart, and a smooth path to checkout on any device.
- Secondary: the store owner/developer who wants a faster, more controllable frontend than the default WooCommerce theme while keeping WooCommerce as the backend for catalog, orders, and payments.

## Core features (prioritized)

### P0 — Product listing
Server-rendered listing of published products from `GET /wp-json/wc/v3/products`, with pagination. Each item shows image, name, price, and a link to the detail page. This is the entry point and must work before anything else.

### P0 — Product detail
Server-rendered detail page from `GET /wp-json/wc/v3/products/{id}` at route `/product/[slug]` (or `[id]`, see architecture). Shows primary image, name, price, description, stock status, and an "Add to cart" action.

### P0 — Client cart
A browser-side cart that lets the shopper add items, change quantities, remove items, and see line and cart totals. Persisted to `localStorage` so it survives reloads. No server round-trip; totals derived from item price and quantity captured at add time and re-validated against catalog data when shown.

### P0 — Checkout handoff
A "Checkout" action that redirects the shopper to the WooCommerce store's checkout with the cart contents attached, so payment happens on WooCommerce. This app never processes payment.

### P1 — Category browsing
A categories view from `GET /wp-json/wc/v3/products/categories` and a per-category listing (products filtered by category). Lets shoppers narrow the catalog.

### P1 — Loading, empty, and error states
Loading skeletons for catalog and detail; empty states for empty catalog, empty category, empty search results, and empty cart; friendly error fallbacks when the WooCommerce API is unreachable or slow.

### P2 — Theming
Light and dark theme with accessible contrast.

## Non-goals

- No checkout, payment processing, or order management inside this app (checkout is handed off to WooCommerce).
- No user accounts, login, or authentication for shoppers.
- No admin UI, product editing, or inventory management.
- No writes to WooCommerce (the app only reads the catalog).
- No product search backend beyond what the WooCommerce REST API offers (a search field, if included, uses the API `search` param; a custom search index is out of scope).
- No wishlists, reviews submission, coupons UI, or multi-currency logic beyond what the store returns.
- No CMS or marketing pages beyond the storefront.
- No server-side session or server-stored cart.

## Success criteria per core feature

### Product listing
- Listing page renders products from the live WooCommerce store with image, name, and formatted price.
- Pagination works and reflects the total product count from response headers.
- Page is server-rendered and cached (ISR); a cold load completes without client-side data fetching for the catalog.
- When the catalog is empty, an empty state is shown instead of a broken grid.
- When the API is down or times out, a friendly error fallback is shown and the failure is logged server-side.

### Product detail
- A valid product slug/id renders full detail (image, name, price, description, stock status).
- An unknown product id returns the app's 404 page.
- "Add to cart" adds the correct product and is reflected in the cart immediately.
- Out-of-stock products show stock status and disable "Add to cart".

### Client cart
- Adding, updating quantity, and removing items update totals correctly.
- Cart persists across reloads via `localStorage`.
- Empty cart shows the empty-cart state with a link back to the catalog.
- Quantities are clamped to sane bounds (minimum 1; not below 0; integer only).

### Checkout handoff
- "Checkout" redirects to the WooCommerce store checkout URL with the current cart items.
- The redirect target is built only from the configured store URL and cart contents; no secrets are exposed.

### Category browsing
- Categories list renders from the API and links to per-category listings.
- A category with no products shows an empty state.

### Loading, empty, and error states
- Every data-fetching route has a loading skeleton.
- Every list has a defined empty state.
- API failures never surface a stack trace or store credentials to the client.
