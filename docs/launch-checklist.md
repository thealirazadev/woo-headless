# Launch checklist: woo-headless

Work top to bottom before shipping to production. Nothing here is checked until verified in a production-like build.

## Environment and configuration
- [ ] Production environment variables set in the host (`WOOCOMMERCE_STORE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`, `NEXT_PUBLIC_STORE_NAME`).
- [ ] `WOOCOMMERCE_STORE_URL` uses HTTPS; the app refuses non-HTTPS.
- [ ] Consumer key/secret are **server-only** — not prefixed `NEXT_PUBLIC_`, not present in any client bundle or network request from the browser.
- [ ] REST API key has read scope only (no write access needed).
- [ ] `.env.local` / real secrets are not committed; only `.env.example` (dummy values) is in the repo.

## Security
- [ ] Verified in DevTools: no consumer key/secret in page source, JS bundles, or network requests.
- [ ] Route params (`[slug]`/`[id]`) validated; invalid -> 404.
- [ ] WooCommerce HTML fields sanitized before render.
- [ ] Error boundaries show generic copy only — no stack traces or store credentials leak to the client.

## Build and runtime
- [ ] Debug/verbose logging off in production; structured logs at the data boundary only.
- [ ] `npm run build` succeeds with no type errors.
- [ ] `npm run lint` clean.
- [ ] `npm run test` passes; `npm run test:e2e` smoke test passes.
- [ ] Source maps not exposing secrets; no `console.log` of sensitive data.

## Images and performance
- [ ] Product image host(s) configured in `next.config.ts` `images.remotePatterns` so `next/image` loads them.
- [ ] ISR / caching (`revalidate`) set for catalog pages; verified pages serve from cache between revalidations.
- [ ] Images have correct `alt` text (WooCommerce alt or product-name fallback).

## UX states
- [ ] Loading skeletons present on every data-fetching route (listing, category, detail).
- [ ] Empty states present: empty catalog, empty category, empty search, empty cart.
- [ ] Friendly error fallback with retry on API failure/timeout.
- [ ] Custom `404` (not-found) and `500`/error pages styled per `design.md`.
- [ ] Long product titles clamp without breaking layout.
- [ ] Cart persists across reloads; checkout button disabled when cart is empty.

## Accessibility
- [ ] Semantic landmarks (`header`/`nav`/`main`/`footer`), one `<h1>` per page, logical heading order.
- [ ] All controls have accessible names; cart button announces item count.
- [ ] Keyboard operable end to end; cart drawer focus-trapped, `Esc` closes, focus returns to trigger; skip-to-content link present.
- [ ] Visible focus rings everywhere; `prefers-reduced-motion` respected.
- [ ] Contrast meets WCAG AA in both light and dark themes.

## Cross-device
- [ ] Mobile layout checked (2-column grid, drawer/cart page, tap targets >= 44px).
- [ ] Tablet and desktop breakpoints checked.
- [ ] Light and dark themes checked on real devices/emulators.

## Checkout handoff
- [ ] "Checkout" redirects to the correct WooCommerce store checkout with cart items.
- [ ] Redirect URL contains no secrets (only public store base + product ids/quantities).
- [ ] Cart footer notes shipping/taxes are calculated at checkout.

## Final
- [ ] `docs/memory.md` updated (Completed / Decisions).
- [ ] All phase verification checklists in `docs/phases.md` complete.
