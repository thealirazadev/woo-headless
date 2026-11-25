# Design decisions

## 1. The store stays the source of truth; this app only reads

The storefront reads products and categories from the WooCommerce REST API (`wc/v3`) and never
writes to it. It holds no orders, payments, or customer accounts: the only state it owns is the
shopper's cart, and that is handed to the store at checkout. A read-only REST key is therefore
enough, and a leaked key cannot change the store.

## 2. Credentials never leave the server

All catalog requests go through `wooGet()` in `lib/woocommerce/client.ts`, which is only called from
server components. It reads the consumer key and secret through `getServerEnv()` in `lib/env.ts`
and sends them as a Basic `Authorization` header, not as `consumer_key` and `consumer_secret` query
parameters, so they never appear in a URL that could be logged or cached. Neither variable has a
`NEXT_PUBLIC_` prefix. Client components that need the store URL, such as the cart drawer and cart
page, get it as a prop from a server component (`app/layout.tsx`, `app/cart/page.tsx`) instead of
importing `lib/env.ts`. As a second guard, `redactUrl()` strips credential parameters from any URL
before it reaches the logger.

## 3. HTTPS only

`getServerEnv()` rejects a `WOOCOMMERCE_STORE_URL` that is not `https:`, because Basic auth over
plain HTTP would send the credentials in clear text. One consequence is that the end-to-end test
cannot point at a plain HTTP mock. `tests/e2e/mock-store-server.mjs` is a small Node HTTPS server
with a throwaway self-signed certificate, and `NODE_TLS_REJECT_UNAUTHORIZED=0` is set only in the
Playwright web server environment for that run, never in application code.

## 4. Store failures become typed errors

`wooGet()` aborts after 8 seconds and maps every outcome to a `WooCommerceError` with a code:
`timeout`, `network`, `misconfiguration` (401 or 403), `not_found` (404), `retryable` (429 or 5xx),
or `unknown`. Pages branch on the code rather than on raw statuses: a `not_found` becomes
`notFound()`, everything else reaches the error boundary with a friendly message. Each request logs
one JSON line with the event, status or code, duration, and redacted path, and nothing else.

## 5. Catalog pages are cached for 60 seconds

Fetches pass `next: { revalidate: 60 }` and the listing, category, and product routes export
`revalidate = 60`, so a burst of traffic does not become a burst of REST calls, and price or stock
changes still show up within a minute. The categories index has no dynamic segment or search
parameters, so `next build` tried to prerender it and needed a reachable store at build time. That
route is marked `force-dynamic`; the fetch-level revalidation still caches the response, so the
build no longer depends on the network.

## 6. Store content is sanitized; names are decoded

WooCommerce returns HTML in `description`, `short_description`, and `price_html`. `sanitizeHtml()`
in `lib/format.ts` keeps a short allowlist of tags, removes `script`, `style`, `iframe`, and
similar elements with their contents, drops every attribute except a safe `href` on links, and
adds `rel="noopener noreferrer"`. A link is kept only if it starts with `http(s)://`, `mailto:`, a
same-site path, `#`, or `?`. Allowlisting the prefix, rather than blocking `javascript:`, also
rejects entity-encoded or whitespace-obfuscated schemes. This is deliberately not a full HTML parser,
which would have meant a new dependency.

Testing against a real store showed that WordPress returns names entity-encoded (`Café &amp; Bar`),
and React escapes them again, so shoppers saw the raw entity. Product and category
names now pass through `decodeEntities()` and are still rendered as text, never as HTML.

## 7. A small persisted client cart, safe during server rendering

The cart is a Zustand store with the `persist` middleware under the `woo-headless-cart` key.
Quantities are clamped to whole numbers of at least 1, and adding an item that is already present
increases its quantity. The drawer's open state lives in the same store but is excluded from
persistence with `partialize`, which avoided a second state mechanism for one boolean.

`next build` originally failed while prerendering `/_not-found` with "Cannot read properties of
undefined (reading 'hasHydrated')". `createJSONStorage(() => localStorage)` calls its getter
eagerly; on the server `localStorage` is undefined, `createJSONStorage` swallows the error and
returns nothing, and `persist` then skips attaching `.persist` altogether. `getCartStorage()` now
returns a no-op `Storage` on the server and the real `localStorage` in the browser. Components that
show the cart count wait for `useCartHydrated()` so the server render and the first client render
match.

## 8. Checkout uses WooCommerce's shareable checkout link

`buildCheckoutUrl()` produces `{store}/checkout-link/?products=id:qty,id:qty`, which fills the
store's cart session and opens its checkout. Only product ids and quantities go into the URL. The
first version sent repeated `add-to-cart[]` and `quantity[]` parameters to `/checkout`; against a
real WooCommerce 11.3 store that form was ignored and the shopper landed on an empty cart. The
shareable link was verified to add the right items and quantities.

## 9. Only simple, purchasable products go into the local cart

The shareable checkout link rejects a bare parent id for a variable product, and options have to be
chosen on the store anyway, so a product whose `type` is not `simple` shows "Choose options" and
links to the store's product page instead of adding to the cart. Products with `purchasable: false`
(for example, no price) show a disabled "Unavailable" button, which fixed a case where they could be
added at $0. Out-of-stock products show a disabled "Out of stock" button. Unknown stock statuses map
to out of stock, the safe default.

## 10. Route input is validated before it reaches the API

Product and category slugs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`; anything else is `notFound()`
without a request. Page numbers parse to a positive integer and fall back to 1. A page past the end,
such as an old bookmark, re-fetches the last real page rather than showing an empty catalog. Search
uses the WooCommerce `search` parameter through a plain GET form on `/?q=`, trimmed and capped at
100 characters, and pagination keeps the query string.

## 11. Real 404s with loading skeletons kept

A `loading.tsx` boundary lets Next start streaming with status 200 before the page knows the item
is missing, so `notFound()` alone only rendered the not-found page on a 200 (a soft 404; Next does
add a `noindex` robots tag). Calling `notFound()` from `generateMetadata` did not change that. The
fix keeps the skeletons and moves the lookup ahead of any streaming:

- **Product detail** exports an empty `generateStaticParams`, so `/product/[slug]` is an on-demand
  ISR route. Next renders an ISR page in full before responding, so a missing product returns a
  404 status, cached and revalidated like any other ISR result (60 seconds). The skeleton can
  still show during client-side navigation while a page is generated.
- **Category listing** reads `?page=`, so it must stay dynamic. `app/category/[slug]/layout.tsx`
  resolves the category before the segment's `loading.tsx` boundary, so an unknown slug throws
  `notFound()` while the response status can still change. The skeleton then covers the product
  fetch only.
- **The root listing skeleton** moved to `app/(home)/loading.tsx`. A root `app/loading.tsx` wraps
  every route, which would start streaming before the category layout runs. `/category` and
  `/cart` no longer show the home grid skeleton, which never matched their layout anyway.

`app/not-found.tsx` also declares `robots: { index: false }` so the 404 page stays out of search
indexes independent of Next's default. The Playwright smoke test asserts the 404 status for both
an unknown product and an unknown category.

## 12. Theme applied before first paint

`ThemeScript` is a small inline script in `<head>` that reads `woo-headless-theme` from
`localStorage`, or the system preference when nothing is stored, and adds the `dark` class before
the page paints, so there is no flash of the wrong theme. Hover scaling on product cards uses
Tailwind's `motion-safe:` variant, so `prefers-reduced-motion` removes it.

## 13. Tests mock the store, and coverage is gated on `lib/`

Unit and component tests mock `fetch` and the client; none touch a real store. The coverage gate
applies to `lib/` only (90% lines and statements, 85% functions, 80% branches), where the mapping,
error handling, cart math, and checkout URL logic live. A component test suite once failed with
spurious "multiple elements found" errors because React Testing Library was not cleaning up between
tests under Vitest; `tests/setup.ts` now calls `cleanup()` in `afterEach`. The Playwright smoke test
runs against `next build && next start` instead of `next dev`, whose file watcher could exhaust
file handles and make server startup flaky.
