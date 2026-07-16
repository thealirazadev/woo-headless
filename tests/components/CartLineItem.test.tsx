import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { useCartStore } from '@/lib/cart/store';
import type { CartItem } from '@/lib/types';

const item: CartItem = {
  productId: 1,
  slug: 'widget',
  name: 'Widget',
  priceAtAdd: '9.99',
  image: { src: '/w.jpg', alt: 'Widget photo' },
  quantity: 2,
};

describe('CartLineItem', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [item] });
  });

  it('renders name, unit price, quantity, and line total', () => {
    render(<CartLineItem item={item} />);
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$19.98')).toBeInTheDocument();
  });

  it('disables the decrease control at quantity 1', () => {
    render(<CartLineItem item={{ ...item, quantity: 1 }} />);
    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
  });

  it('increases the quantity in the store when clicking +', async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={item} />);
    await user.click(screen.getByLabelText('Increase quantity'));
    expect(useCartStore.getState().items.find((i) => i.productId === 1)?.quantity).toBe(3);
  });

  it('removes the item from the store when clicking Remove', async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={item} />);
    await user.click(screen.getByText('Remove'));
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
