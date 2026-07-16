# Memory: woo-headless

Running log of what is done, what is in flight, and decisions worth remembering. Keep entries short and dated. Update as work progresses.

## Completed

- 2026-07-15 — Planning documentation created (README, PRD, architecture, rules, design, api-contracts, phases, testing, launch-checklist, .env.example).
- 2026-07-17 — Phase 1 (scaffold + WooCommerce client): Next.js App Router + TypeScript + Tailwind scaffold, ESLint/Prettier, `lib/env.ts` (HTTPS-only, server-only secrets), `lib/logger.ts` (structured, redacted), `lib/woocommerce/client.ts` (auth header, 8s timeout, typed `WooCommerceError`, X-WP-Total/TotalPages), mappers to domain `Product`/`Category` types, Vitest unit tests. `npm install` run and `package-lock.json` committed (was missing from the working tree before this session). Committed in 7 commits matching the phase-1 list in `docs/phases.md`.
- 2026-07-17 — Phase 2 (product listing): UI primitives (`Button`, `Price`, `Skeleton`, `EmptyState`), `ProductCard`/`ProductGrid`, home listing via `getProducts()` with `revalidate = 60`, listing skeleton/error fallback, `Pagination` + `lib/pagination.ts` page-param validation with out-of-range fallback to the last real page. Component tests added; fixed a real bug where RTL wasn't auto-cleaning up between tests (added `afterEach(cleanup)` to `tests/setup.ts`) which was causing false "multiple elements found" failures.
- 2026-07-17 — Phase 3 (product detail): `app/product/[slug]/page.tsx` with slug validation (`lib/slug.ts`) and `notFound()` on invalid/missing slug, `StockBadge`, `AddToCartButton` (initially a disabled-aware stub), detail skeleton, global `app/not-found.tsx`. Fixed a `noUncheckedIndexedAccess` build failure by falling back to the placeholder image when `images[0]` is undefined.
- 2026-07-17 — Phase 4 (client cart): `lib/cart/store.ts` (Zustand + persist, `woo-headless-cart` key, quantity clamping, `isDrawerOpen` UI state colocated in the same store rather than a second store/context), `lib/cart/selectors.ts`, `AddToCartButton` wired to `addItem`, `CartButton` with a hydration-safe badge, `Header`, `CartLiveRegion` (aria-live announcements), `CartDrawer` (focus-trapped, Esc closes, restores focus to trigger), `CartLineItem`, `app/cart/page.tsx`. `ProductCard` restructured so the add-to-cart button is a sibling of the detail link, not nested inside it (per `design.md`).
  - Real bug found and fixed: `next build` failed prerendering `/_not-found` with `Cannot read properties of undefined (reading 'hasHydrated')`. Root cause: zustand's `createJSONStorage(() => localStorage)` calls the getter eagerly; under SSR/Node `localStorage` throws a `ReferenceError`, `createJSONStorage` swallows it and returns `undefined`, and zustand's `persist` middleware then skips attaching `.persist` entirely when `storage` is falsy. Fixed with an SSR-safe storage getter (`getCartStorage()` in `lib/cart/store.ts`) that returns a no-op storage object server-side and the real `window.localStorage` in the browser.

## In progress

- Phase 5 (category browsing) onward, per `docs/phases.md`.

## Decisions log

- 2026-07-15 — Cart state uses Zustand with a localStorage persistence middleware. React Context is the only pre-approved alternative; any other state library needs approval.
- 2026-07-15 — Catalog is fetched only in server components with ISR; the WooCommerce consumer key/secret stay server-only and are never exposed to the client.
- 2026-07-15 — Checkout is handed off to the WooCommerce store; this app does not process payments or write to WooCommerce.
- 2026-07-15 — Dependency versions are pinned exactly and the lockfile is committed; new dependencies require approval.
- 2026-07-17 — No live WooCommerce store/credentials are available in this environment. All automated tests mock the WooCommerce REST client/`fetch` per `docs/testing.md`; `.env.local` holds placeholder values only (gitignored). Live integration testing against a real store still needs a human with real store credentials — see the note at the end of this log.
- 2026-07-17 — Cart drawer open/closed state lives in the same Zustand store as the cart items (not persisted, via `partialize`), rather than a separate store or React context, to avoid adding a second state mechanism for one boolean.
- 2026-07-17 — **Action needed from a human with real WooCommerce store credentials:** set real values in a local `.env.local` (never commit them) and run the app against the live store to verify `getProducts()`/`getProductBySlug()`/`getCategories()` against real REST responses, confirm the image host in `next.config.ts` matches the store's actual media domain, and validate the Phase 6 checkout handoff redirects to the real store checkout. Everything up to this point has only been verified against mocked responses.
