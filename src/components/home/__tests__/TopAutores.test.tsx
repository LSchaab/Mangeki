import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TopAutores } from '@/components/home/TopAutores';
import { featuredAuthors } from '@/data/catalog';

describe('TopAutores', () => {
  it('renders the heading', () => {
    render(<TopAutores />);
    expect(
      screen.getByRole('heading', { name: 'Top Autores 2025' }),
    ).toBeInTheDocument();
  });

  it('renders a card for each featured author with its notable work', () => {
    render(<TopAutores />);
    const authors = featuredAuthors();
    expect(authors).toHaveLength(6);

    for (const author of authors) {
      expect(screen.getByText(author.name)).toBeInTheDocument();
      expect(screen.getByText(author.notableWork)).toBeInTheDocument();
    }

    // One avatar image per author.
    const avatars = screen.getAllByRole('img', { hidden: false });
    expect(avatars).toHaveLength(authors.length);
  });

  it('renders no links pointing to /autores', () => {
    render(<TopAutores />);
    const autoresLinks = screen
      .queryAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/autores'));
    expect(autoresLinks).toHaveLength(0);
  });
});
