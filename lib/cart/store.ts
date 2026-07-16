'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

const CART_STORAGE_KEY = 'woo-headless-cart';

export interface AddToCartInput {
  productId: number;
  slug: string;
  name: string;
  priceAtAdd: string;
  image: { src: string; alt: string } | null;
  quantity?: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/** Clamps a quantity to a positive integer, minimum 1. */
function clampQuantity(quantity: number): number {
  const rounded = Math.floor(quantity);
  return Number.isFinite(rounded) && rounded > 0 ? rounded : 1;
}

/**
 * `localStorage` does not exist during server rendering. `createJSONStorage`'s getter runs
 * eagerly, and letting it throw makes zustand's persist middleware skip attaching `.persist`
 * entirely (breaking `useCartHydrated` at prerender time) - so fall back to a no-op storage
 * on the server and only touch the real `localStorage` in the browser.
 */
function getCartStorage(): Storage {
  if (typeof window === 'undefined') {
    return {
      length: 0,
      clear: () => {},
      key: () => null,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,
      addItem: (input) =>
        set((state) => {
          const quantity = clampQuantity(input.quantity ?? 1);
          const existing = state.items.find((item) => item.productId === input.productId);

          if (!existing) {
            return {
              items: [
                ...state.items,
                {
                  productId: input.productId,
                  slug: input.slug,
                  name: input.name,
                  priceAtAdd: input.priceAtAdd,
                  image: input.image,
                  quantity,
                },
              ],
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === input.productId
                ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
                : item,
            ),
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: clampQuantity(quantity) } : item,
          ),
        })),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(getCartStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** True once the persisted cart has been read from localStorage. Guards SSR/hydration mismatches. */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useCartStore.persist.hasHydrated());

  useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated());
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
