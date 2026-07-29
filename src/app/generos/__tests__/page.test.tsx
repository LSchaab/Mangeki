import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GenerosPage from '@/app/generos/page';
import { allGenres, titlesByGenre } from '@/data/catalog';

describe('GenerosPage', () => {
  it('renders the H1 "Géneros"', () => {
    render(<GenerosPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Géneros' }),
    ).toBeInTheDocument();
  });

  it('renders a link to every genre', () => {
    render(<GenerosPage />);
    const genres = allGenres();
    expect(genres.length).toBeGreaterThan(0);

    for (const genre of genres) {
      const link = screen.getByRole('link', {
        name: new RegExp(genre.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      });
      expect(link).toHaveAttribute('href', `/generos/${genre.slug}`);
    }
  });

  it('shows the title count for each genre', () => {
    render(<GenerosPage />);
    const genres = allGenres();
    for (const genre of genres) {
      const link = screen.getByRole('link', {
        name: new RegExp(genre.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      });
      expect(link.textContent ?? '').toContain(
        String(titlesByGenre(genre.slug).length),
      );
    }
  });

  it('lists genres sorted by name', () => {
    render(<GenerosPage />);
    const rendered = screen
      .getAllByRole('link')
      .map((el) => el.textContent ?? '');
    const expected = allGenres()
      .map((g) => g.name)
      .sort((a, b) => a.localeCompare(b));
    expect(rendered[0]).toContain(expected[0]);
  });
});
