# Launch checklist: woo-headless

Work top to bottom before shipping to production. Nothing here is checked until verified in a production-like build.

## Environment and configuration
- [ ] Production environment variables set in the host (`WOOCOMMERCE_STORE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`, `NEXT_PUBLIC_STORE_NAME`). _(needs a real host/deploy target)_
- [x] `WOOCOMMERCE_STORE_URL` uses HTTPS; the app refuses non-HTTPS. (`lib/env.ts` `assertHttps`; the e2e mock store and every dev run used an `https://` URL)
- [x] Consumer key/secret are **server-only** — not prefixed `NEXT_PUBLIC_`, not present in any client bundle or network request from the browser. (`tests/unit/client.test.ts`, `tests/components/CheckoutButton.test.tsx` assert this)
- [ ] REST API key has read scope only (no write access needed). _(set when the real key is issued on the live store)_
- [x] `.env.local` / real secrets are not committed; only `.env.example` (dummy values) is in the repo.

## Security
- [ ] Verified in DevTools: no consumer key/secret in page source, JS bundles, or network requests. _(automated equivalent covered by tests above; needs a manual pass against a real deployed build)_
- [x] Route params (`[slug]`/`[id]`) validated; invalid -> 404.
- [x] WooCommerce HTML fields sanitized before render.
- [x] Error boundaries show generic copy only — no stack traces or store credentials leak to the client.

## Build and runtime
- [x] Debug/verbose logging off in production; structured logs at the data boundary only.
- [x] `npm run build` succeeds with no type errors.
- [x] `npm run lint` clean.
- [x] `npm run test` passes; `npm run test:e2e` smoke test passes (against the mock WooCommerce server in `tests/e2e/mock-store-server.mjs`).
- [ ] Source maps not exposing secrets; no `console.log` of sensitive data. _(no stray `console.log` in the codebase; production source-map config not yet decided for a real deploy target)_

## Images and performance
- [x] Product image host(s) configured in `next.config.ts` `images.remotePatterns` so `next/image` loads them.
- [ ] ISR / caching (`revalidate`) set for catalog pages; verified pages serve from cache between revalidations. (`revalidate = 60` is set on every catalog route; observing real cache behavior needs a live store)
- [x] Images have correct `alt` text (WooCommerce alt or product-name fallback).

## UX states
- [x] Loading skeletons present on every data-fetching route (listing, category, detail).
- [ ] Empty states present: empty catalog, empty category, empty search, empty cart. (catalog/category/cart empty states shipped; no search feature was in scope for any phase, so there is no empty-search state)
- [x] Friendly error fallback with retry on API failure/timeout.
- [x] Custom `404` (not-found) and `500`/error pages styled per `design.md`.
- [x] Long product titles clamp without breaking layout.
- [x] Cart persists across reloads; checkout button disabled when cart is empty.

## Accessibility
- [ ] Semantic landmarks (`header`/`nav`/`main`/`footer`), one `<h1>` per page, logical heading order. (`header`/`nav`/`main` present; no `Footer` component was in scope for any phase)
- [x] All controls have accessible names; cart button announces item count.
- [x] Keyboard operable end to end; cart drawer focus-trapped, `Esc` closes, focus returns to trigger; skip-to-content link present.
- [x] Visible focus rings everywhere; `prefers-reduced-motion` respected.
- [ ] Contrast meets WCAG AA in both light and dark themes. _(tokens were chosen against the AA targets in `design.md`; no automated contrast audit has been run)_

## Cross-device
- [ ] Mobile layout checked (2-column grid, drawer/cart page, tap targets >= 44px). _(needs a real device/emulator pass)_
- [ ] Tablet and desktop breakpoints checked. _(needs a real device/emulator pass)_
- [ ] Light and dark themes checked on real devices/emulators.

## Checkout handoff
- [x] "Checkout" redirects to the correct WooCommerce store checkout with cart items. (verified against the mock store in the Playwright smoke test)
- [x] Redirect URL contains no secrets (only public store base + product ids/quantities).
- [x] Cart footer notes shipping/taxes are calculated at checkout.

## Final
- [x] `docs/memory.md` updated (Completed / Decisions).
- [ ] All phase verification checklists in `docs/phases.md` complete. (automated build/lint/test/e2e pass for every phase; the manual-only bullets - e.g. eyeballing a real browser session, DevTools network audit - still need a human)
