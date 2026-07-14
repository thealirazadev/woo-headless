# API Contracts: WooCommerce REST (wc/v3) consumed by woo-headless

This app **consumes** the WooCommerce REST API. It does not define its own HTTP API. All endpoints below are called **server-side only** via `lib/woocommerce/`. Base URL is `${WOOCOMMERCE_STORE_URL}/wp-json/wc/v3`.

## Authentication

- WooCommerce REST API keys: a **consumer key** and **consumer secret** (read scope is sufficient).
- Sent **over HTTPS only**. Two supported transports:
  - Query string: `?consumer_key=ck_xxx&consumer_secret=cs_xxx` (simplest for server-to-server over HTTPS).
  - HTTP Basic auth header: `Authorization: Basic base64(consumer_key:consumer_secret)`.
- The client (`lib/woocommerce/client.ts`) picks one approach and uses it consistently. Prefer the `Authorization` header so secrets are not written into request URLs that might be logged.
- **Never** send these keys from the browser. If `WOOCOMMERCE_STORE_URL` is not `https://`, the client must refuse to run and log a misconfiguration error.

## Endpoints consumed

### 1. List products — `GET /wp-json/wc/v3/products`

Used by the home listing and category listing.

Query params the app uses:

| Param | Value | Purpose |
| --- | --- | --- |
| `page` | integer >= 1 | Pagination page (default 1) |
| `per_page` | integer, capped (default 12, max 24) | Page size |
| `status` | `publish` | Only published products |
| `category` | category id | Filter by category (category listing) |
| `search` | string | Optional search term |
| `orderby` / `order` | e.g. `date` / `desc` | Sort (optional) |

Response: JSON array of product objects. Relevant fields the app relies on:

```
id, slug, name, permalink, type, status,
price, regular_price, sale_price, on_sale, price_html,
description, short_description,
stock_status, stock_quantity, purchasable,
images: [{ id, src, alt, name }],
categories: [{ id, name, slug }]
```

### 2. Single product — `GET /wp-json/wc/v3/products/{id}`

Used by the product detail page. Same fields as above for one product. If the app routes by slug, resolve slug -> product via `GET /products?slug={slug}` (returns an array; take the first) and then optionally fetch by id, or rely on the array item directly.

- `200` -> map to `Product`.
- `404` -> route calls `notFound()` (app 404 page).

### 3. Product categories — `GET /wp-json/wc/v3/products/categories`

Used by the categories index and to resolve a category slug to an id for filtering.

Query params used: `per_page` (default 100, capped), `hide_empty` (`true` to skip empty categories on the index), `slug` (to resolve one category).

Relevant response fields:

```
id, name, slug, parent, count, image: { src, alt } | null
```

## Response fields the app depends on

The mapper (`lib/woocommerce/map.ts`) must tolerate missing/optional fields and never assume presence beyond the core set below. Anything not listed is ignored.

- **Product (required to render):** `id`, `slug`, `name`, `permalink`, `price` or `price_html`, `stock_status`, `images` (may be empty -> use a placeholder image), `purchasable`.
- **Product (detail additionally):** `description`, `short_description`, `regular_price`, `sale_price`, `on_sale`, `categories`.
- **Category:** `id`, `name`, `slug`, `count`.

HTML fields (`price_html`, `description`, `short_description`) are sanitized before rendering.

## Pagination

- WooCommerce returns pagination metadata in **response headers**, not the body:
  - `X-WP-Total` — total number of items.
  - `X-WP-TotalPages` — total number of pages.
- The client reads these headers and returns `{ items, total, totalPages }` so the `Pagination` component can render page controls. Do not attempt to infer totals from array length.
- Page size is fixed by `per_page`; the app caps it (max 24) and clamps `page` to `[1, totalPages]`.

## Rate limits

- WooCommerce core does not impose a fixed documented rate limit, but the host or security plugins may throttle. Treat `429 Too Many Requests` and `5xx` as transient.
- Mitigations in this app:
  - Server-side fetching with **ISR/caching** (`next.revalidate`) drastically reduces call volume; identical catalog pages are served from cache between revalidations.
  - A per-request **timeout** (AbortController, ~8s) prevents hanging on a slow store.
  - On `429`/`5xx`/timeout, render a retryable error state; do not hammer the API with automatic retries beyond a single optional retry with backoff.

## Error and timeout handling -> UI state mapping

All handled centrally in `lib/woocommerce/client.ts`, which throws a typed `WooCommerceError { status, code, message }`. Routes map errors to UI as follows:

| Condition | Detected as | Server log | UI state |
| --- | --- | --- | --- |
| Network unreachable | fetch throws | `error` event with path | Error fallback + "Try again" |
| Timeout (~8s) | AbortController abort | `code: 'timeout'` | Error fallback + "Try again" |
| `401` / `403` | status | `error` misconfiguration (redact keys) | Generic error (do not reveal auth issue to client) |
| `404` (single product) | status | `warn` | App 404 page (`notFound()`) |
| `429` | status | `warn` retryable | Retryable error state |
| `5xx` | status | `error` | Retryable error state |
| `200` with empty array | ok | `info` (optional) | Empty state (not an error) |
| `200` with data | ok | `info` (optional, with durationMs) | Rendered content |

- The client never leaks the store URL with credentials, the raw response body, or a stack trace to the browser. UI copy is generic and friendly (see `design.md`).
- Structured logging (`lib/logger.ts`) records `{ level, event, status?, code?, durationMs?, path }` with credentials redacted.
