import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { Title } from '@/data/types';
import { TitleCard } from '@/components/TitleCard';
import { TitleGrid } from '@/components/TitleGrid';
import { TitleCarousel } from '@/components/TitleCarousel';

const fixture: Title = {
  id: '2',
  slug: 'alguien-como-tu',
  title: 'Alguien como tú',
  type: 'manhwa',
  status: 'ongoing',
  synopsis: 'Un romance moderno.',
  coverUrl: '/covers/alguien-como-tu.jpg',
  score: 9,
  chapters: 42,
  views: 160_000,
  latestChapter: 42,
  updatedAgo: 'Hace 50 min.',
  authorIds: ['a1'],
  genres: ['romance'],
};

describe('TitleCard', () => {
  it('links to /titulo/[id]', () => {
    render(<TitleCard title={fixture} />);
    const link = screen.getByRole('link', { name: /Alguien como tú/i });
    expect(link).toHaveAttribute('href', '/titulo/2');
  });

  it('shows the score badge as X/10', () => {
    render(<TitleCard title={fixture} />);
    expect(screen.getByText('9/10')).toBeInTheDocument();
  });

  it('shows views footer in the views variant', () => {
    render(<TitleCard title={fixture} variant="views" />);
    expect(screen.getByText(/160k Vistas/)).toBeInTheDocument();
  });

  it('shows chapter/updated footer in the updates variant', () => {
    render(<TitleCard title={fixture} variant="updates" />);
    expect(screen.getByText(/Cap\.42/)).toBeInTheDocument();
    expect(screen.getByText(/Hace 50 min\./)).toBeInTheDocument();
  });
});

describe('TitleGrid', () => {
  it('renders a card per title', () => {
    render(<TitleGrid titles={[fixture]} />);
    expect(
      screen.getByRole('link', { name: /Alguien como tú/i }),
    ).toBeInTheDocument();
  });

  it('renders the empty state when there are no titles', () => {
    render(<TitleGrid titles={[]} />);
    expect(screen.getByText('No hay nada aquí todavía.')).toBeInTheDocument();
  });
});

describe('TitleCarousel', () => {
  it('renders a card per title', () => {
    render(<TitleCarousel titles={[fixture]} variant="updates" />);
    expect(screen.getByText(/Cap\.42/)).toBeInTheDocument();
  });
});
