import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound, { metadata } from '@/app/not-found';

describe('NotFound', () => {
  it('asks search engines not to index the 404 page', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('renders the not-found message with a way home', () => {
    render(NotFound());
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
