# Memory: woo-headless

Running log of what is done, what is in flight, and decisions worth remembering. Keep entries short and dated. Update as work progresses.

## Completed

- 2026-07-15 — Planning documentation created (README, PRD, architecture, rules, design, api-contracts, phases, testing, launch-checklist, .env.example).

## In progress

- _(nothing yet)_

## Decisions log

- 2026-07-15 — Cart state uses Zustand with a localStorage persistence middleware. React Context is the only pre-approved alternative; any other state library needs approval.
- 2026-07-15 — Catalog is fetched only in server components with ISR; the WooCommerce consumer key/secret stay server-only and are never exposed to the client.
- 2026-07-15 — Checkout is handed off to the WooCommerce store; this app does not process payments or write to WooCommerce.
- 2026-07-15 — Dependency versions are pinned exactly and the lockfile is committed; new dependencies require approval.
