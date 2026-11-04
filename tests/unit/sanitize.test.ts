import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '@/lib/format';

describe('sanitizeHtml link hrefs', () => {
  it('keeps http, https, mailto and relative links', () => {
    expect(sanitizeHtml('<a href="https://example.com">x</a>')).toContain(
      'href="https://example.com"',
    );
    expect(sanitizeHtml('<a href="http://example.com">x</a>')).toContain(
      'href="http://example.com"',
    );
    expect(sanitizeHtml('<a href="mailto:a@b.co">x</a>')).toContain(
      'href="mailto:a@b.co"',
    );
    expect(sanitizeHtml('<a href="/product/shirt">x</a>')).toContain(
      'href="/product/shirt"',
    );
  });

  it.each([
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    '&#106;avascript:alert(1)',
    'java&#x09;script:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example.com',
  ])('drops unsafe href %s', (href) => {
    const out = sanitizeHtml(`<a href="${href}">x</a>`);
    expect(out).not.toContain('href');
    expect(out).toContain('<a>x</a>');
  });
});
