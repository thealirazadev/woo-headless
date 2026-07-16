// Minimal HTTPS stand-in for the WooCommerce REST API, used only by the Playwright
// smoke test (see docs/testing.md: "does not require live store credentials in CI").
// Generates a throwaway self-signed cert via the system `openssl` binary - no new
// npm dependency - since lib/env.ts refuses non-https store URLs.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';

const PORT = 8443;
const certDir = fs.mkdtempSync(path.join(os.tmpdir(), 'woo-mock-'));
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

execSync(
  `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 1 -nodes -subj "/CN=127.0.0.1"`,
  { stdio: 'ignore' },
);

const products = [
  {
    id: 1,
    slug: 'test-widget',
    name: 'Test Widget',
    permalink: `https://127.0.0.1:${PORT}/product/test-widget`,
    price: '19.99',
    regular_price: '19.99',
    sale_price: '',
    on_sale: false,
    price_html: '<span class="amount">$19.99</span>',
    description: '<p>A reliable test widget.</p>',
    short_description: '<p>A test widget.</p>',
    stock_status: 'instock',
    purchasable: true,
    images: [{ id: 1, src: `https://127.0.0.1:${PORT}/widget.jpg`, alt: 'Test Widget' }],
    categories: [{ id: 1, name: 'Widgets', slug: 'widgets' }],
  },
];

const server = https.createServer(
  { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) },
  (req, res) => {
    const url = new URL(req.url ?? '/', `https://127.0.0.1:${PORT}`);

    if (url.pathname === '/wp-json/wc/v3/products/categories') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-WP-Total': '0',
        'X-WP-TotalPages': '0',
      });
      res.end(JSON.stringify([]));
      return;
    }

    if (url.pathname === '/wp-json/wc/v3/products') {
      const slug = url.searchParams.get('slug');
      const body = slug ? products.filter((p) => p.slug === slug) : products;
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-WP-Total': String(body.length),
        'X-WP-TotalPages': body.length > 0 ? '1' : '0',
      });
      res.end(JSON.stringify(body));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  },
);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Mock WooCommerce server listening on https://127.0.0.1:${PORT}`);
});
