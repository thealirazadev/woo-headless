import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '@/lib/cart/store';

const product = {
  productId: 1,
  slug: 'widget',
  name: 'Widget',
  priceAtAdd: '9.99',
  image: null,
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isDrawerOpen: false });
  });

  it('adds a new item with quantity 1 by default', () => {
    useCartStore.getState().addItem(product);
    expect(useCartStore.getState().items).toEqual([{ ...product, quantity: 1 }]);
  });

  it('increments quantity when adding the same product again', () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem({ ...product, quantity: 2 });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(3);
  });

  it('clamps added quantity to a positive integer', () => {
    useCartStore.getState().addItem({ ...product, quantity: -5 });
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    useCartStore.getState().clear();
    useCartStore.getState().addItem({ ...product, quantity: 2.7 });
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it('updates quantity and clamps to a minimum of 1', () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().updateQuantity(1, 5);
    expect(useCartStore.getState().items[0]?.quantity).toBe(5);

    useCartStore.getState().updateQuantity(1, 0);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    useCartStore.getState().updateQuantity(1, -3);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
  });

  it('removes an item by product id', () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('clears the entire cart', () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem({ ...product, productId: 2 });
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('opens and closes the drawer', () => {
    useCartStore.getState().openDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(true);
    useCartStore.getState().closeDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(false);
  });
});
