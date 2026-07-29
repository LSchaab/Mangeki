import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Tendencias } from '@/components/home/Tendencias';

describe('Tendencias', () => {
  it('renders the heading and at least one card linking to /titulo/', () => {
    render(<Tendencias />);
    expect(
      screen.getByRole('heading', { name: 'Tendencias' }),
    ).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(
      links.some((l) => l.getAttribute('href')?.startsWith('/titulo/')),
    ).toBe(true);
  });

  it('exposes Semana and Filtro dropdowns', () => {
    render(<Tendencias />);
    expect(screen.getByLabelText('Semana')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtro')).toBeInTheDocument();
  });

  it('filters the shown cards when a genre is chosen in Filtro', async () => {
    const user = userEvent.setup();
    render(<Tendencias />);

    const before = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/titulo/')).length;

    const filtro = screen.getByLabelText('Filtro') as HTMLSelectElement;
    // Pick a genre option that is not the default "Todos".
    const genreOption = within(filtro)
      .getAllByRole('option')
      .find((o) => (o as HTMLOptionElement).value !== '');
    expect(genreOption).toBeDefined();

    await user.selectOptions(filtro, (genreOption as HTMLOptionElement).value);

    const after = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/titulo/')).length;

    // Filtering by a specific genre shows fewer cards than the full list.
    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThan(0);
  });
});
