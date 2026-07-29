import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TopAutores } from '@/components/home/TopAutores';

describe('TopAutores', () => {
  it('renders the heading', () => {
    render(<TopAutores />);
    expect(
      screen.getByRole('heading', { name: 'Top Autores 2023' }),
    ).toBeInTheDocument();
  });

  it('renders 6 "Leer más" links pointing to /autores/', () => {
    render(<TopAutores />);
    const links = screen.getAllByRole('link', { name: /Leer más/i });
    expect(links).toHaveLength(6);
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/autores\//);
    }
  });
});
