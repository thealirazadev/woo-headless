# Changelog

## Unreleased

Tested end to end against a real WooCommerce 11.3 store (Docker, HTTPS, read-only key).

### Fixed
- Checkout handoff left the store cart empty: WooCommerce ignores `add-to-cart[]`
  arrays. The cart now hands off through WooCommerce's `/checkout-link/?products=id:qty`.
- Products the store will not sell (no price, `purchasable: false`) could be added at $0.
- Variable, grouped, and external products could be added without choosing options;
  they now link to the store's product page ("Choose options") and show a "From" price.
- Category and product names showed raw HTML entities ("Caf&eacute; &amp; Bar").
- "1 products" on the categories page.

### Added
- Product search in the header, using the WooCommerce `search` parameter, with a
  no-results state and pagination that keeps the search term.
- Coverage gate on `lib/` and CI on Node 20 and 22.

## 0.1.0

- Catalog, category and product pages from the WooCommerce REST API, client cart,
  checkout handoff, loading and empty states, dark mode.
