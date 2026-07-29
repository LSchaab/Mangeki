import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import CatalogoPage from '@/app/catalogo/page';

describe('CatalogoPage', () => {
  it('renders the H1 "Catálogo"', () => {
    render(<CatalogoPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Catálogo' }),
    ).toBeInTheDocument();
  });

  it('toggles aria-pressed when the "Manhua" type filter is clicked', async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);

    const todos = screen.getByRole('button', { name: 'Todos' });
    const manhua = screen.getByRole('button', { name: 'Manhua' });

    expect(todos).toHaveAttribute('aria-pressed', 'true');
    expect(manhua).toHaveAttribute('aria-pressed', 'false');

    await user.click(manhua);

    expect(manhua).toHaveAttribute('aria-pressed', 'true');
    expect(todos).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates the "<n> títulos" count when a filter is applied', async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);

    const countLabel = screen.getByText(/\d+ títulos/);
    const initialCount = Number(countLabel.textContent!.match(/\d+/)![0]);
    expect(initialCount).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Manhua' }));

    const filteredCount = Number(
      screen.getByText(/\d+ títulos/).textContent!.match(/\d+/)![0],
    );
    expect(filteredCount).toBeLessThan(initialCount);
  });
});
