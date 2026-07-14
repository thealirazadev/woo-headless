# Design: woo-headless storefront UI

This is the full UI design spec. It is implementable directly with Tailwind CSS and the token set below. All components must support light and dark themes and meet the accessibility rules at the end.

## Design principles

- Content first: the product and its price are the loudest things on screen.
- Calm, neutral surfaces with a single accent color for actions.
- Every interactive element has visible hover, focus, disabled, and (where relevant) loading states.
- Nothing shifts layout when data loads: skeletons occupy the final layout's space.

## Color and theme

Use Tailwind's `class` dark-mode strategy (`<html class="dark">`). Define tokens as CSS variables in `app/globals.css` and map them in `tailwind.config.ts` so components use semantic names (`bg-surface`, `text-fg`, `text-accent`), not raw hex.

### Semantic tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | `#ffffff` | `#0b0f19` | Page background |
| `surface` | `#f7f8fa` | `#131826` | Cards, drawer, header |
| `surface-2` | `#eef0f4` | `#1b2233` | Skeleton base, subtle fills |
| `border` | `#e2e5ea` | `#273049` | Card and input borders |
| `fg` | `#0f172a` | `#e6e9f0` | Primary text |
| `fg-muted` | `#5b6472` | `#9aa4b8` | Secondary text, meta |
| `accent` | `#2563eb` | `#3b82f6` | Primary action, links |
| `accent-fg` | `#ffffff` | `#0b0f19` | Text on accent |
| `accent-hover` | `#1d4ed8` | `#60a5fa` | Accent hover |
| `success` | `#16a34a` | `#22c55e` | In-stock badge |
| `warning` | `#d97706` | `#f59e0b` | Backorder / low stock |
| `danger` | `#dc2626` | `#f87171` | Out-of-stock, errors |
| `focus-ring` | `#2563eb` | `#60a5fa` | Focus outline |

All text/background pairs above target WCAG AA (>= 4.5:1 for body text, >= 3:1 for large text and UI borders). Verify accent-on-surface and muted-on-surface pairs during implementation.

## Typography

- Font family: system UI stack by default (`ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`). Optionally a single variable display font via `next/font` for headings; if added, it counts as a dependency decision.
- Monospace only for prices if desired (optional); default is the sans stack with tabular numerals for prices.

### Type scale (rem)

| Role | Size | Weight | Line height |
| --- | --- | --- | --- |
| Display / page title | 2.0 (32px) | 700 | 1.15 |
| Section heading | 1.5 (24px) | 600 | 1.2 |
| Product title (detail) | 1.25 (20px) | 600 | 1.3 |
| Card title | 1.0 (16px) | 600 | 1.35 |
| Body | 1.0 (16px) | 400 | 1.55 |
| Meta / small | 0.875 (14px) | 400 | 1.45 |
| Price (emphasis) | 1.125 (18px) | 700, tabular-nums | 1.2 |

## Spacing, radius, shadow

- **Spacing:** 4/8px base scale. Use Tailwind steps `1`(4), `2`(8), `3`(12), `4`(16), `6`(24), `8`(32), `12`(48). Card padding 16px; section gaps 24-32px; grid gap 16-24px.
- **Radius:** `sm` 6px (inputs, badges), `md` 10px (cards, buttons), `lg` 16px (drawer, modal), `full` for avatars/pills.
- **Shadow:** `sm` for cards at rest `0 1px 2px rgba(0,0,0,0.06)`; `md` on hover `0 6px 16px rgba(0,0,0,0.10)`; drawer `lg` `0 12px 32px rgba(0,0,0,0.20)`. In dark mode reduce shadow opacity and lean on `border`/`surface-2` for separation.

## Product card states

Card = image (4:5 or 1:1, `next/image`, `object-cover`), title (clamp to 2 lines), price, and an add-to-cart affordance. The whole card links to the detail page; the add-to-cart control is a separate focusable button (not nested inside the card link).

- **Rest:** `surface` bg, `border`, `shadow-sm`, radius `md`.
- **Hover:** `shadow-md`, slight image scale (`scale-[1.02]`) with `transition` ~150ms, title color unchanged.
- **Focus-within / keyboard focus:** visible `focus-ring` (2px outline, 2px offset) on the focused control; card does not swallow focus.
- **Loading (skeleton):** see skeletons.
- **Out of stock:** dim image (`opacity-70`), show `Out of stock` badge (`danger`), disable the card's add-to-cart button.
- **Long titles:** clamp to 2 lines with ellipsis (`line-clamp-2`); price and button stay aligned at the card bottom regardless of title length (flex column, title area flexes).

## Button states

Variants: `primary` (accent), `secondary` (surface + border), `ghost` (text only), `danger` (for remove). All share sizing tokens; height 40px default (`h-10`), 44px touch target on mobile controls.

| State | Primary appearance |
| --- | --- |
| Rest | `bg-accent text-accent-fg`, radius `md` |
| Hover | `bg-accent-hover` |
| Focus-visible | 2px `focus-ring` outline, 2px offset, keep hover/rest bg |
| Active/pressed | slight `scale-[0.98]` |
| Disabled | `opacity-50 cursor-not-allowed`, no hover change, `aria-disabled` |
| Loading | show spinner + `aria-busy="true"`, keep width stable, disable interaction, label changes to e.g. `Adding...` |

Secondary/ghost mirror the same state matrix on their own base colors. Never remove the focus ring for aesthetics.

## Loading skeletons

Use `Skeleton` primitive: `surface-2` background with a subtle shimmer/pulse (`animate-pulse`), radius matching the real element. Skeletons must match the final layout footprint so there is no layout shift.

- **Listing skeleton (`app/loading.tsx`):** grid of 8-12 card skeletons (image block + two text lines + price line).
- **Category listing skeleton:** same grid.
- **Product detail skeleton (`app/product/[slug]/loading.tsx`):** image block (left), then title line, price line, three description lines, and a button block (right).
- **Cart:** line-item skeletons if the cart page ever awaits data (normally instant from localStorage).

## Empty states

Shared `EmptyState` component: centered icon/illustration (simple inline SVG, no emoji), a short heading, one line of guidance, and a primary action.

- **Empty catalog:** "No products yet" + "This store has no published products." (no action, or link to home).
- **Empty category:** "Nothing in this category" + link "Browse all products".
- **Empty search results:** "No results for '<query>'" + "Try a different search." + clear-search action.
- **Empty cart:** "Your cart is empty" + "Add something you like to get started." + primary button "Browse products" -> `/`.

## Error state

- Route error boundary and inline error blocks use a calm, non-alarming card: `danger`-tinted icon, heading "Something went wrong", one line "We couldn't load this right now. Please try again.", and a "Try again" button (retry / `reset()`). No technical detail, no stack trace.

## Header and layout

- Sticky header on `surface` with store name (`NEXT_PUBLIC_STORE_NAME`), primary nav (All products, Categories), theme toggle, and a cart button showing item count as a badge.
- Content max width ~1200px, centered, with responsive gutters (16px mobile, 24px+ desktop).
- Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop for product cards.

## Cart drawer / page

- Cart button opens a right-side drawer (`lg` radius left corners, `shadow-lg`) on desktop, or navigates to `/cart` on small screens (either is acceptable; drawer preferred).
- Each line: thumbnail, name (link), unit price, quantity stepper (`-` / value / `+`, min 1), line total, remove (danger ghost).
- Footer: subtotal (tabular numerals), a note that shipping/taxes are calculated at checkout, and a full-width primary "Checkout" button that triggers the handoff.
- Quantity stepper: `+`/`-` buttons are real `<button>`s with `aria-label` ("Increase quantity", "Decrease quantity"); the value is a live region or an accessible number input.

## Accessibility (required)

- **Semantic markup:** use `<header>`, `<nav>`, `<main>`, `<footer>`, `<ul>/<li>` for lists, `<h1>` per page (product name on detail, page title on listing), logical heading order.
- **Labels:** every control has an accessible name (`aria-label` or visible label). The cart button announces item count ("Cart, 3 items"). Icon-only buttons always have labels.
- **Keyboard:** full keyboard operability — tab order follows visual order, drawer is focus-trapped when open and returns focus to the trigger on close, `Esc` closes the drawer. No keyboard traps elsewhere.
- **Focus:** visible `focus-ring` on all interactive elements; never `outline: none` without a replacement. Skip-to-content link at the top.
- **Contrast:** meet WCAG AA using the token pairs above; verify in both themes.
- **Images:** every product image has meaningful `alt` from the WooCommerce image alt or the product name as fallback; decorative images use `alt=""`.
- **Motion:** respect `prefers-reduced-motion` — disable hover scale and shimmer for users who request reduced motion.
- **Live updates:** adding to cart announces via an `aria-live="polite"` region ("Added <product> to cart").
