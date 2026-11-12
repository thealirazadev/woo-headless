# Security policy

## Supported versions

Only the latest release on `main` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private vulnerability reporting
(Security tab, "Report a vulnerability") or email thealirazadev@gmail.com with the
steps to reproduce. You should get a reply within 72 hours.

## How the app protects a store

- The WooCommerce consumer key and secret are read only on the server (`lib/env.ts`)
  and sent in an `Authorization` header, never in URLs or to the browser.
- The app refuses to start against a store URL that is not `https`.
- A read-only REST key is enough; the app never writes to WooCommerce.
- Product HTML (`description`, `short_description`, `price_html`) is sanitized with an
  allowlist before rendering; `javascript:` and other unsafe link schemes are dropped.
- Checkout is handed off to the store's own `/checkout-link/`; the app never sees
  payment details.
