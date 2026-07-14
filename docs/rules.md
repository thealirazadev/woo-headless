# Rules: woo-headless

These rules are binding for anyone implementing this project. When a rule and a request conflict, flag it rather than silently diverging (see Boundaries).

## Conventions

### Libraries and patterns
- Use **Next.js App Router** with server components by default. Only add `"use client"` where interactivity or browser APIs are required.
- Data fetching for the catalog happens **only in server components** through `lib/woocommerce/`. Never fetch the catalog from the browser.
- Client cart state uses **Zustand** with a `localStorage` persistence middleware (`lib/cart/store.ts`). React Context is the only pre-approved alternative; anything else needs approval.
- Styling uses **Tailwind CSS** utility classes with the shared tokens in `tailwind.config.ts`. No inline styles except truly dynamic values; no additional CSS-in-JS library.
- Images use **`next/image`** only. No raw `<img>` for product media.
- Format prices through `lib/format.ts` / the `Price` component, not ad hoc string concatenation.

### Server vs client components
- **Server components** (default): pages, listing, product cards, product detail content, anything that reads catalog data or touches env/secrets.
- **Client components** (`"use client"`): add-to-cart, cart button/drawer/line items, quantity controls, checkout button, theme toggle, and any component reading the cart store.
- Never import server-only modules (`lib/env.ts` secret access, `lib/woocommerce/client.ts`) into a client component. Pass already-fetched, serializable data down as props.

### What to avoid
- No exposing `WOOCOMMERCE_CONSUMER_KEY` / `WOOCOMMERCE_CONSUMER_SECRET` to the client, ever.
- No client-side catalog fetching, no API routes that proxy the raw secrets to the browser.
- No duplicating catalog data into client state.
- No unpinned or `^`/`~` dependency ranges.
- No dead code, commented-out blocks, or speculative abstractions (see Simplicity).
- No `any` in domain code; map raw responses into typed domain objects.

### Naming
- Files/components: `PascalCase.tsx` for components (`ProductCard.tsx`), `camelCase.ts` for non-component modules (`products.ts`, `format.ts`).
- Route folders follow Next conventions (`app/product/[slug]/page.tsx`).
- Functions: `camelCase`, descriptive verbs (`getProductBySlug`, `buildCheckoutUrl`).
- Types/interfaces: `PascalCase` (`Product`, `CartItem`). Raw API types prefixed `Wc` (`WcProduct`) in `lib/woocommerce/types.ts`.
- Constants: `UPPER_SNAKE_CASE`. localStorage keys are namespaced (`woo-headless-cart`, `woo-headless-theme`).

### Commit format
- **Conventional Commits** with a short imperative subject: `type(scope): subject`.
- Allowed types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `build`, `ci`.
- Example: `feat(catalog): render product listing from wc/v3`.
- **ONE COMMIT PER FEATURE / TASK.** Never batch multiple features into a single commit. Each commit in `docs/phases.md` maps to exactly one logical change. Follow the commit order listed per phase.
- Subject in imperative mood, no trailing period, roughly <= 72 chars.

### Dependencies
- **Pin exact versions** (no `^`, no `~`) in `package.json`.
- **Commit the lockfile** (`package-lock.json`) with every dependency change.
- Adding, removing, or upgrading any dependency requires approval (see Boundaries).

## Error handling and logging

- **One consistent approach:** all WooCommerce access goes through `lib/woocommerce/client.ts`, which is the single place that performs fetches, applies a timeout, checks status, and throws a typed `WooCommerceError { status, code, message }`. Callers never handle raw `fetch` errors.
- **Handle these failure modes explicitly:**
  - API unreachable / network error -> typed error -> route renders a friendly error fallback (`app/error.tsx` or an inline error state).
  - Timeout: wrap fetch with an `AbortController` timeout (for example 8s). On abort, throw a `WooCommerceError` with `code: 'timeout'`.
  - Non-2xx status: map `401/403` to an internal "misconfiguration" error (log detail, show generic message), `404` on a product to the app 404 (`notFound()`), `429`/`5xx` to a retryable error state.
  - Empty results: return an empty typed array and let the UI render its **empty state** (not an error).
- **Friendly UI vs detailed server logs:** the client sees short, human messages ("We couldn't load products right now. Please try again."). Full detail (URL path without secrets, status, error code, duration) is logged **server-side** via `lib/logger.ts`.
- **Never leak** store credentials, full request URLs containing keys, or stack traces to the client. Error boundaries render generic copy only.
- **Structured logging from day one:** `lib/logger.ts` emits JSON-ish structured entries `{ level, event, status?, durationMs?, path? }`. Use it in the WooCommerce client and route error boundaries. No `console.log` scattered in components; log at the data-access boundary. Redact any credential-bearing values before logging.

## Security

- `WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET` are **server-only**. They are read exclusively in `lib/env.ts` / `lib/woocommerce/client.ts`, never imported by client components, never prefixed `NEXT_PUBLIC_`.
- **All WooCommerce calls run server-side.** No browser request ever carries the consumer key/secret.
- Auth is sent over **HTTPS only** (reject/flag non-`https` `WOOCOMMERCE_STORE_URL`). Prefer query-string consumer key/secret over HTTPS as documented in `api-contracts.md`, or HTTP Basic over HTTPS; never over plain HTTP.
- **Validate route params:** `[slug]`/`[id]` params are validated (id is a positive integer; slug matches an expected pattern) before use. Unknown/invalid -> `notFound()`.
- **Sanitize any user input:** any query string used for search or pagination is coerced and bounded (page >= 1, perPage within a fixed max). WooCommerce HTML fields (`description`, `short_description`, `price_html`) are sanitized before rendering (strip scripts; render via a sanitizer, not raw `dangerouslySetInnerHTML` without cleaning).
- **Public vs server-only data (document and enforce):**
  - Server-only: consumer key/secret, `WOOCOMMERCE_STORE_URL` (used to build requests), raw API responses.
  - Public (safe in the browser): mapped `Product`/`Category` fields rendered on the page, `NEXT_PUBLIC_STORE_NAME`, the checkout redirect URL (built from public store base + cart).

## Simplicity (YAGNI / KISS)

- Build only what the current phase in `docs/phases.md` requires. No features "for later".
- Prefer the smallest thing that satisfies the acceptance criteria. No premature abstraction, no config for hypothetical stores.
- One data source (WooCommerce REST). No caching layer beyond Next's `fetch`/ISR. No state manager beyond the cart store.
- If a simpler approach meets the criteria, choose it and note the decision in `docs/memory.md`.

## Code style

- Comments are **sparse** and explain *why*, not *what*. No commented-out code.
- Concise docstrings on non-obvious exported functions (one or two lines).
- No emoji anywhere in code, comments, docs, or commit messages.
- No AI/assistant/authorship mentions anywhere (no "generated by", no "co-authored by").
- Follow ESLint + Prettier; do not hand-format around the formatter.
- TypeScript strict mode on; no `any` in domain code; explicit return types on exported functions.

## Boundaries

- **No wholesale delete or rewrite** of existing working code. Make targeted, minimal changes.
- **Do not change `PRD.md` or `architecture.md`** without flagging the change first and getting agreement. Treat them as the contract.
- **No new dependency without approval.** Propose it (what, why, size, alternative) and wait.
- **Ask when ambiguous.** If a requirement is unclear or two docs disagree, stop and ask rather than guessing.
- **Stop after 2 failed fix attempts** on the same problem; report what was tried, the errors seen, and a proposed next step.
- **Scope every change** as one of: *current phase* (do it), *new phase* (propose adding a phase), or *backlog* (add to the Backlog in `docs/phases.md`). Do not silently expand scope.
