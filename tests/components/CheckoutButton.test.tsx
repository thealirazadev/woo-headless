import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { useCartStore } from '@/lib/cart/store';

describe('CheckoutButton', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('is disabled when the cart is empty', () => {
    render(<CheckoutButton storeBaseUrl="https://store.example.com" />);
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
  });

  it('links to the store checkout with no secrets when the cart has items', () => {
    useCartStore.setState({
      items: [
        { productId: 1, slug: 'widget', name: 'Widget', priceAtAdd: '9.99', image: null, quantity: 1 },
      ],
    });
    render(<CheckoutButton storeBaseUrl="https://store.example.com" />);
    const link = screen.getByRole('link', { name: 'Checkout' });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain('https://store.example.com/checkout');
    expect(href).not.toContain('consumer_key');
    expect(href).not.toContain('consumer_secret');
  });
});
