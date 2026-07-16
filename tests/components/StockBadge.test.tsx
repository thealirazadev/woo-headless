import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockBadge } from '@/components/product/StockBadge';

describe('StockBadge', () => {
  it('renders the in-stock label', () => {
    render(<StockBadge status="instock" />);
    expect(screen.getByText('In stock')).toBeInTheDocument();
  });

  it('renders the out-of-stock label', () => {
    render(<StockBadge status="outofstock" />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('renders the backorder label', () => {
    render(<StockBadge status="onbackorder" />);
    expect(screen.getByText('On backorder')).toBeInTheDocument();
  });
});
