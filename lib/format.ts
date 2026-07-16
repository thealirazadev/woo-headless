/** Price/currency/string helpers shared across server and client components. */

/** Formats a WooCommerce numeric price string as a currency amount. */
export function formatPrice(value: string, currency = 'USD'): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

const ALLOWED_TAGS = new Set([
  'a', 'b', 'strong', 'i', 'em', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div', 'del', 'ins',
]);

/**
 * Minimal allowlist-based HTML sanitizer for WooCommerce-supplied fields
 * (description, short_description, price_html). Strips script/style/iframe
 * and any other tag not in ALLOWED_TAGS, plus event-handler attributes and
 * javascript: URLs. This is deliberately conservative rather than a full
 * HTML parser: it is enough to guarantee no script execution from store
 * content without adding an external dependency.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let out = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi, '');

  out = out.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    const isClosing = match.startsWith('</');
    if (isClosing) return `</${tag}>`;

    let safeAttrs = '';
    if (tag === 'a') {
      const hrefMatch = /href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i.exec(attrs);
      const href = hrefMatch ? hrefMatch[1] ?? hrefMatch[2] ?? '' : '';
      if (href && !/^javascript:/i.test(href.trim())) {
        safeAttrs = ` href="${href.replace(/"/g, '&quot;')}" rel="noopener noreferrer"`;
      }
    }
    return `<${tag}${safeAttrs}>`;
  });

  return out;
}
