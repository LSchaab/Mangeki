import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AutoresPage from '@/app/autores/page';
import { allAuthors } from '@/data/catalog';

describe('AutoresPage', () => {
  it('renders the H1 "Autores"', () => {
    render(<AutoresPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Autores' }),
    ).toBeInTheDocument();
  });

  it('renders a link to every author profile', () => {
    render(<AutoresPage />);
    const authors = allAuthors();
    expect(authors.length).toBeGreaterThan(0);

    // Match by unique href, not by name: author names can share substrings
    // (e.g. "ONE" is a substring of "NEMONE"), which makes name-based queries
    // ambiguous as the catalog grows.
    const hrefs = screen
      .getAllByRole('link')
      .map((el) => el.getAttribute('href'));
    for (const author of authors) {
      expect(hrefs).toContain(`/autores/${author.id}`);
    }
  });

  it('lists authors sorted by name', () => {
    render(<AutoresPage />);
    const rendered = screen
      .getAllByRole('link')
      .map((el) => el.textContent ?? '');
    const expected = allAuthors()
      .map((a) => a.name)
      .sort((a, b) => a.localeCompare(b));
    // The first rendered author link text should start with the first sorted name.
    expect(rendered[0]).toContain(expected[0]);
  });
});
