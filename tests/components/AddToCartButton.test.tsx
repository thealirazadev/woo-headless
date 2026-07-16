import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { useCartStore } from '@/lib/cart/store';

const product = {
  productId: 1,
  slug: 'widget',
  name: 'Widget',
  price: '9.99',
  image: { src: '/w.jpg', alt: 'Widget photo' },
};

describe('AddToCartButton', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('is enabled and labeled "Add to cart" by default', () => {
    render(<AddToCartButton {...product} />);
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  });

  it('is disabled and labeled "Out of stock" when out of stock', () => {
    render(<AddToCartButton {...product} disabled />);
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
  });

  it('adds the product to the cart store when clicked', async () => {
    const user = userEvent.setup();
    render(<AddToCartButton {...product} />);
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ productId: 1, quantity: 1, name: 'Widget' });
  });
});
