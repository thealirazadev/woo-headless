import { test, expect } from '@playwright/test';

test('browse -> open product -> add to cart -> see cart count', async ({ page }) => {
  await page.goto('/');

  const productLink = page.getByRole('link', { name: /Test Widget/ });
  await expect(productLink.first()).toBeVisible();

  await productLink.first().click();
  await expect(page.getByRole('heading', { name: 'Test Widget' })).toBeVisible();
  await expect(page.getByText('$19.99').first()).toBeVisible();

  await page.getByRole('button', { name: 'Add to cart' }).click();

  const cartButton = page.getByRole('button', { name: /Cart, 1 item/ });
  await expect(cartButton).toBeVisible();

  await cartButton.click();
  await expect(page.getByRole('dialog', { name: 'Shopping cart' })).toBeVisible();
  await expect(page.getByText('Subtotal')).toBeVisible();

  const checkoutLink = page.getByRole('link', { name: 'Checkout' });
  await expect(checkoutLink).toBeVisible();
  const href = await checkoutLink.getAttribute('href');
  expect(href).toContain('/checkout');
  expect(href).not.toContain('consumer_key');
  expect(href).not.toContain('consumer_secret');
});

test('unknown product slug shows the 404 page with a 404 status', async ({ page }) => {
  const response = await page.goto('/product/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByText("We couldn't find what you were looking for.")).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    'content',
    /noindex/,
  );
});

test('unknown category slug shows the 404 page with a 404 status', async ({ page }) => {
  const response = await page.goto('/category/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByText("We couldn't find what you were looking for.")).toBeVisible();
});
