const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Validates a route param as a plausible WooCommerce product/category slug. */
export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
