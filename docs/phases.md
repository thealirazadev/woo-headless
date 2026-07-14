# Phases: woo-headless

Ship in the smallest useful increments. Do phases in order; each phase should leave the app runnable. One commit per feature/task, in the listed order, Conventional Commits. Build and tests must pass before a feature is done (see `docs/testing.md`).

---

## Phase 1 — Project scaffold and WooCommerce client

Stand up the Next.js + TypeScript + Tailwind app and a working, tested server-side WooCommerce client. No catalog UI yet beyond a bare home page proving a fetch works.

### Definition of done
- Next.js (App Router) + TypeScript + Tailwind project boots with `npm run dev`.
- ESLint + Prettier configured; `npm run lint` passes.
- Exact dependency versions pinned; `package-lock.json` committed.
- `.env.example` present; `lib/env.ts` validates env and refuses non-HTTPS `WOOCOMMERCE_STORE_URL`.
- `lib/woocommerce/client.ts` performs authenticated HTTPS requests server-side, applies an ~8s timeout, and throws typed `WooCommerceError`.
- `lib/logger.ts` emits structured entries with credentials redacted.
- `getProducts()` returns `{ items, total, totalPages }` reading `X-WP-Total` / `X-WP-TotalPages`.
- Vitest runs; at least the mapper and client error-mapping unit tests pass.

### Manual test checklist
- `npm run dev` serves `http://localhost:3000` without errors.
- With valid `.env.local`, a temporary debug render (or a unit test) shows real product count from the store.
- With an invalid consumer key, the app logs a redacted misconfiguration error server-side and shows a generic message (no keys, no stack trace in the browser).
- With a non-HTTPS store URL, the client refuses to run.

### Commits
- `chore(scaffold): init next app router with typescript`
- `chore(tooling): add eslint prettier and tailwind config`
- `feat(env): add validated server-only env access`
- `feat(logger): add structured server logger with redaction`
- `feat(woocommerce): add rest client with auth timeout and error mapping`
- `feat(woocommerce): add product and category mappers to domain types`
- `test(woocommerce): cover mappers and client error mapping`

---

## Phase 2 — Product listing

Render the catalog on the home page from `GET /products`, server-side, cached with ISR, with loading skeleton, empty state, and error fallback.

### Definition of done
- `app/page.tsx` (server component) lists products via `getProducts()` with ISR.
- `ProductCard`, `ProductGrid`, `Price`, `Skeleton`, `EmptyState`, `Button` components exist per `design.md`.
- `app/loading.tsx` shows the listing skeleton; `app/error.tsx` shows the friendly error fallback with retry.
- Empty catalog renders the empty state.
- `Pagination` works using `total`/`totalPages`; `page` param clamped and validated.
- Images render through `next/image`; store image host configured in `next.config.ts`.
- Long product titles clamp to two lines without breaking layout.

### Manual test checklist
- Home page shows products with image, name, price.
- Pagination moves between pages and reflects the real total.
- Empty catalog (or a filtered-to-empty state) shows the empty state, not a broken grid.
- Kill network / use bad credentials -> friendly error fallback, retry works, server log recorded.
- Throttle network (slow 3G) -> skeleton shows first, no layout shift on load.

### Commits
- `feat(ui): add button price skeleton and empty state primitives`
- `feat(catalog): render product listing from wc/v3 with isr`
- `feat(catalog): add listing loading skeleton and error fallback`
- `feat(catalog): add pagination with validated page param`
- `test(catalog): cover product card and pagination`

---

## Phase 3 — Product detail

Render a single product page with add-to-cart affordance (button present; cart wired in Phase 4).

### Definition of done
- `app/product/[slug]/page.tsx` renders detail via slug resolution (`GET /products?slug=` then map).
- Shows gallery image, name (`<h1>`), price, sanitized description, stock status.
- Route param validated; unknown product -> `notFound()` (app 404 page).
- Out-of-stock products show status and a disabled add-to-cart button.
- `app/product/[slug]/loading.tsx` detail skeleton; `app/not-found.tsx` global 404.
- Metadata (title using `NEXT_PUBLIC_STORE_NAME` + product name).

### Manual test checklist
- Valid product slug renders full detail.
- Unknown slug shows the 404 page.
- Out-of-stock product disables add-to-cart and shows the badge.
- Description HTML is sanitized (no script execution).
- Slow network -> detail skeleton, then content, no layout shift.

### Commits
- `feat(product): add product detail page with slug resolution`
- `feat(product): add stock badge and disabled add-to-cart state`
- `feat(product): add detail skeleton and 404 handling`
- `test(product): cover detail rendering and not-found`

---

## Phase 4 — Client cart

Add the Zustand cart store with localStorage persistence and full cart UI.

### Definition of done
- `lib/cart/store.ts` (Zustand + persist) with add/update/remove/clear; localStorage key `woo-headless-cart`.
- `lib/cart/selectors.ts` derives item count, line totals, subtotal.
- `AddToCartButton`, `CartButton` (with count badge), `CartDrawer` (focus-trapped), `CartLineItem` (quantity stepper), and `app/cart/page.tsx`.
- Quantities clamped (integer, min 1); remove works; empty cart shows the empty-cart state.
- Cart persists across reload; hydration guarded against SSR mismatch.
- Adding announces via `aria-live` region.

### Manual test checklist
- Add from card and from detail; count badge updates.
- Change quantity and remove; subtotal updates correctly.
- Reload page; cart persists.
- Empty the cart; empty-cart state with "Browse products" link shows.
- Keyboard: open drawer, tab through, `Esc` closes and returns focus to trigger.

### Commits
- `feat(cart): add zustand store with localstorage persistence`
- `feat(cart): add cart selectors for totals and count`
- `feat(cart): add add-to-cart button and cart button with badge`
- `feat(cart): add cart drawer with quantity controls and empty state`
- `test(cart): cover store math and quantity clamping`

---

## Phase 5 — Category browsing

Categories index and per-category listing.

### Definition of done
- `app/category/page.tsx` lists categories from `GET /products/categories` (hide empty on index).
- `app/category/[slug]/page.tsx` lists products filtered by resolved category id, with pagination, skeleton, empty state.
- Header nav links to categories.
- Category with no products shows the empty-category state.

### Manual test checklist
- Categories index shows categories with counts and links.
- Clicking a category shows its products with working pagination.
- Empty category shows the empty state.
- Invalid category slug -> 404 or empty state (validated param).

### Commits
- `feat(category): add categories index page`
- `feat(category): add per-category listing with pagination`
- `test(category): cover category resolution and empty state`

---

## Phase 6 — Checkout handoff

Redirect the cart to the WooCommerce store checkout.

### Definition of done
- `lib/cart/checkout.ts` builds the WooCommerce checkout redirect URL from the store base + cart items.
- `CheckoutButton` navigates the browser to that URL; disabled when cart is empty.
- No secrets in the redirect URL; only public store base + product ids/quantities.
- Cart footer notes shipping/taxes are calculated at checkout.

### Manual test checklist
- With items in the cart, "Checkout" navigates to the WooCommerce checkout with those items.
- Empty cart disables the checkout button.
- Inspect the redirect URL: no consumer key/secret present.

### Commits
- `feat(checkout): build woocommerce checkout redirect url`
- `feat(checkout): wire checkout button with empty-cart guard`
- `test(checkout): cover redirect url construction`

---

## Phase 7 — Theming, polish, and e2e

Light/dark theme, reduced-motion, and a Playwright smoke test.

### Definition of done
- Theme toggle (light/dark) persisted to `woo-headless-theme`; respects system preference on first load.
- `prefers-reduced-motion` disables hover scale and shimmer.
- Accessibility pass: focus rings, labels, skip link, alt text, contrast in both themes.
- Playwright smoke test covers browse -> open product -> add to cart -> see cart count.
- `404`/`500` pages styled per `design.md`.

### Manual test checklist
- Toggle theme; persists across reload; both themes meet contrast.
- Keyboard-only navigation works across listing, detail, and cart.
- Playwright smoke test passes locally.

### Commits
- `feat(theme): add light and dark theme toggle with persistence`
- `feat(a11y): add skip link focus states and reduced-motion handling`
- `test(e2e): add playwright browse-to-cart smoke test`
- `docs(launch): tick launch checklist items that are complete`

---

## Phase verification (run at the end of every phase)

- [ ] `npm run dev` runs; the phase's pages load without console errors.
- [ ] `npm run build` succeeds.
- [ ] `npm run test` (and `npm run test:e2e` from Phase 7 on) passes.
- [ ] Browser console and network tab clean (no failed requests, no leaked secrets in requests).
- [ ] Unhappy paths checked:
  - [ ] API down / unreachable -> friendly error fallback, server log recorded.
  - [ ] Product not found -> 404 page.
  - [ ] Empty catalog -> empty state.
  - [ ] Empty category -> empty-category state.
  - [ ] Empty cart -> empty-cart state.
  - [ ] Slow network -> skeletons show, no layout shift.
  - [ ] Invalid credentials -> generic error to client, redacted detail in server log, no keys/stack trace in browser.
- [ ] Empty and loading states present for every data-fetching route added this phase.
- [ ] Long product titles do not break card or detail layout.
- [ ] No consumer key/secret reachable from the client (checked in DevTools network + source).

## Backlog

_(empty)_
