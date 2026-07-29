import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import NuevoYPopularPage from '@/app/nuevo-y-popular/page';

describe('NuevoYPopularPage', () => {
  it('renders the H1 plus "Popular" and "Nuevos" sections with cards', () => {
    render(<NuevoYPopularPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Nuevo & Popular' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Popular' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Nuevos' }),
    ).toBeInTheDocument();

    const cards = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/titulo/'));
    expect(cards.length).toBeGreaterThan(0);
  });

  it('links to Catálogo and Géneros', () => {
    render(<NuevoYPopularPage />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/catalogo')).toBe(true);
    expect(links.some((l) => l.getAttribute('href') === '/generos')).toBe(true);
  });

  it('toggles aria-pressed when a type filter is clicked', async () => {
    const user = userEvent.setup();
    render(<NuevoYPopularPage />);

    const todos = screen.getByRole('button', { name: 'Todos' });
    const manhua = screen.getByRole('button', { name: 'Manhua' });

    // Default: Todos active.
    expect(todos).toHaveAttribute('aria-pressed', 'true');
    expect(manhua).toHaveAttribute('aria-pressed', 'false');

    await user.click(manhua);

    expect(manhua).toHaveAttribute('aria-pressed', 'true');
    expect(todos).toHaveAttribute('aria-pressed', 'false');
  });

  it('exposes a genre select defaulting to all genres', () => {
    render(<NuevoYPopularPage />);
    const select = screen.getByLabelText('Género') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('');
  });
});
