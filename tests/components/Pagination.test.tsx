import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} basePath="/" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('disables Previous on the first page', () => {
    render(<Pagination page={1} totalPages={3} basePath="/" />);
    expect(screen.getByText('Previous')).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables Next on the last page', () => {
    render(<Pagination page={3} totalPages={3} basePath="/" />);
    expect(screen.getByText('Next')).toHaveAttribute('aria-disabled', 'true');
  });

  it('links to the previous and next pages', () => {
    render(<Pagination page={2} totalPages={3} basePath="/" />);
    expect(screen.getByText('Previous')).toHaveAttribute('href', '/?page=1');
    expect(screen.getByText('Next')).toHaveAttribute('href', '/?page=3');
  });
});
