# Architecture: woo-headless

## App flow

1. A request hits an App Router route (for example `/`, `/category/[slug]`, or `/product/[slug]`).
2. The route is a **server component**. It calls the WooCommerce REST client in `lib/woocommerce/` to fetch catalog data (`products`, a single product, or `categories`) over HTTPS using the server-only consumer key/secret.
3. Fetches use Next.js `fetch` caching / ISR (`next.revalidate`) so catalog pages are cached and periodically revalidated. No catalog data is fetched from the browser.
4. The server component maps the raw WooCommerce response into the app's internal types (`Product`, `Category`) and renders the listing or detail UI.
5. Interactive pieces (add-to-cart button, cart drawer, quantity controls, theme toggle) are **client components**. They read and write the cart store.
6. The cart store lives on the client (Zustand) and is persisted to `localStorage`. The cart is never sent to our own server.
7. When the shopper clicks "Checkout", the client builds a redirect URL to the WooCommerce store checkout (using `WOOCOMMERCE_STORE_URL` exposed indirectly through a server-provided value or a public checkout base) with the cart items, and the browser navigates there. Payment happens entirely on WooCommerce.

```
Browser
  |
  |  request /, /category/[slug], /product/[slug]
  v
Next.js server component  ---- fetch (server-only keys, HTTPS, ISR) ---->  WooCommerce REST API (wc/v3)
  |                                                                          products / product / categories
  |  render HTML (listing / detail)
  v
Browser (hydrated)
  |  client components: AddToCart, CartDrawer, QuantityControls, ThemeToggle
  v
Cart store (Zustand) <---> localStorage
  |
  |  Checkout click -> build redirect URL -> navigate
  v
WooCommerce store checkout (payment)
```

## Proposed folder / file tree

```
woo-headless/
  app/
    layout.tsx                  Root layout: html/body, theme, header, cart provider mount
    globals.css                 Tailwind directives + base tokens
    page.tsx                    Home = product listing (server component)
    loading.tsx                 Listing skeleton
    error.tsx                   Route-level error boundary (client)
    not-found.tsx               Global 404
    category/
      page.tsx                  Categories index (server component)
      [slug]/
        page.tsx                Per-category product listing (server component)
        loading.tsx             Category listing skeleton
    product/
      [slug]/
        page.tsx                Product detail (server component)
        loading.tsx             Detail skeleton
        not-found.tsx           Product-specific 404 (optional; falls back to global)
    cart/
      page.tsx                  Full cart page (client component)
  components/
    layout/
      Header.tsx                Store name, nav, cart button, theme toggle (client where needed)
      Footer.tsx
      ThemeToggle.tsx           Client component
    product/
      ProductCard.tsx           Server-renderable card (image, name, price, link)
      ProductGrid.tsx           Grid wrapper
      ProductGallery.tsx        Detail image(s)
      AddToCartButton.tsx       Client component
      StockBadge.tsx
    cart/
      CartButton.tsx            Client: opens drawer, shows item count
      CartDrawer.tsx            Client: cart contents, quantities, totals
      CartLineItem.tsx          Client: single line with quantity controls
      CheckoutButton.tsx        Client: builds redirect and navigates
    ui/
      Button.tsx                Variants + states (hover/focus/disabled/loading)
      Skeleton.tsx              Loading skeleton primitive
      EmptyState.tsx            Shared empty state
      Price.tsx                 Formats price/currency consistently
      Pagination.tsx
  lib/
    woocommerce/
      client.ts                 Low-level fetch wrapper (auth, base URL, timeout, error mapping)
      products.ts               getProducts, getProductBySlug, getProductById
      categories.ts             getCategories, getCategoryBySlug
      types.ts                  Raw WooCommerce response types
      map.ts                    Map raw responses -> internal Product / Category
    cart/
      store.ts                  Zustand store + localStorage persistence
      selectors.ts              Derived totals, item count
      checkout.ts               Build WooCommerce checkout redirect URL
    types.ts                    Internal domain types (Product, Category, CartItem)
    env.ts                      Validated env access (server vs public)
    logger.ts                   Structured server-side logger
    format.ts                   Price/currency/string helpers
  tests/
    unit/                       Vitest unit tests (mappers, cart store, checkout URL)
    components/                 Vitest + Testing Library component tests
    e2e/                        Playwright smoke test
  public/
  docs/
  .env.example
  next.config.ts
  tailwind.config.ts
  postcss.config.mjs
  tsconfig.json
  vitest.config.ts
  playwright.config.ts
  .eslintrc / eslint.config.mjs
  .prettierrc
  package.json
  package-lock.json
```

## Tech stack with rationale

- **Next.js (App Router) + TypeScript** — Server components let catalog fetching (and the secret keys) stay on the server; ISR gives cached, fast catalog pages; file-based routing maps cleanly to listing/category/detail. TypeScript keeps the WooCommerce-to-domain mapping honest.
- **Tailwind CSS** — Fast, consistent styling with a small token surface (spacing, radius, color), works well for the card/button/skeleton states defined in `design.md`, and supports dark mode via the `class` strategy.
- **WooCommerce REST API (wc/v3)** — The store already exposes it; no extra backend to build. Read-only consumer keys keep blast radius small. See `api-contracts.md`.
- **`next/image`** — Handles product image sizing, lazy loading, and format optimization; requires configuring the store's image host in `next.config.ts`.
- **Zustand + `localStorage`** — Minimal client state library for the cart with a simple persistence middleware. No server session needed; the cart is inherently client-owned until checkout handoff. (React Context is an acceptable alternative if a dependency is to be avoided; Zustand is the default choice — see `rules.md` for the approval boundary.)
- **Vitest + Playwright** — Vitest for fast unit/component tests (mappers, cart math, components); one Playwright smoke test for the critical browse-to-cart flow. See `testing.md`.
- **ESLint + Prettier** — Enforce Next/TypeScript conventions and consistent formatting.

## Data model (as consumed / derived)

These are the app's **internal** types, mapped from raw WooCommerce responses in `lib/woocommerce/map.ts`. The raw API returns far more fields; the app deliberately narrows to what it renders.

### Product (derived from `GET /products` and `GET /products/{id}`)

```
Product {
  id: number
  slug: string
  name: string
  permalink: string          // link back to the store product page
  priceHtml: string          // WooCommerce-provided formatted price (price_html)
  price: string              // numeric string from `price`
  regularPrice: string       // `regular_price`
  salePrice: string | null   // `sale_price` or null
  onSale: boolean            // `on_sale`
  currency?: string          // if available from store settings; else formatted via priceHtml
  description: string         // sanitized `description` (detail page)
  shortDescription: string    // sanitized `short_description`
  images: ProductImage[]      // from `images[]` (src, alt)
  stockStatus: 'instock' | 'outofstock' | 'onbackorder'  // `stock_status`
  purchasable: boolean        // `purchasable`
  categories: { id: number; name: string; slug: string }[]  // `categories[]`
}

ProductImage { src: string; alt: string; width?: number; height?: number }
```

### Category (derived from `GET /products/categories`)

```
Category {
  id: number
  name: string
  slug: string
  count: number              // product count, from `count`
  image: { src: string; alt: string } | null  // `image`
  parent: number             // `parent`
}
```

### CartItem (client-owned, not from the API)

```
CartItem {
  productId: number
  slug: string
  name: string
  priceAtAdd: string         // captured numeric price when added
  image: { src: string; alt: string } | null
  quantity: number           // integer >= 1
}

Cart {
  items: CartItem[]
}
```

Derived (in `lib/cart/selectors.ts`): `itemCount`, `subtotal`, per-line `lineTotal`. Prices shown in the cart are re-validated against fresh catalog data when available; `priceAtAdd` is a fallback for display only. Authoritative pricing and totals are computed by WooCommerce at checkout.

## Where state lives

- **Server (per request, cached via ISR):** all catalog data — product listing, product detail, categories. Fetched in server components with `fetch` + `revalidate`. Never duplicated into client state.
- **Client (persistent):** the cart only. Held in a Zustand store, persisted to `localStorage` under a single namespaced key (for example `woo-headless-cart`). Rehydrated on load; guarded against SSR/localStorage mismatches (hydrate after mount).
- **Client (ephemeral):** UI state such as cart drawer open/closed and theme preference (theme persisted separately, for example `woo-headless-theme`).

There is no shared server-side session and no database in this project.

## External dependencies

- A live WooCommerce store exposing the wc/v3 REST API over HTTPS.
- WooCommerce REST consumer key + secret (read scope).
- The store's product image host, added to `next.config.ts` `images.remotePatterns` so `next/image` can load it.

### Required environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `WOOCOMMERCE_STORE_URL` | Server-only | Base URL for REST calls and to derive the checkout redirect base |
| `WOOCOMMERCE_CONSUMER_KEY` | Server-only | REST auth (read) |
| `WOOCOMMERCE_CONSUMER_SECRET` | Server-only | REST auth (read) |
| `NEXT_PUBLIC_STORE_NAME` | Public | Store name shown in header and titles |

`WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET` must never be exposed to the client and must never carry the `NEXT_PUBLIC_` prefix. All access goes through `lib/env.ts`, which reads server-only values only in server code. See `.env.example`.
