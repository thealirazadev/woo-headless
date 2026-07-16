import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AddToCartButton } from '@/components/product/AddToCartButton';

describe('AddToCartButton', () => {
  it('is enabled and labeled "Add to cart" by default', () => {
    render(<AddToCartButton />);
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  });

  it('is disabled and labeled "Out of stock" when out of stock', () => {
    render(<AddToCartButton disabled />);
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
  });
});
