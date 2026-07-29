import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Actualizaciones } from '@/components/home/Actualizaciones';

describe('Actualizaciones', () => {
  it('renders the heading and a chapter (updates) card', () => {
    render(<Actualizaciones />);
    expect(
      screen.getByRole('heading', { name: 'Actualizaciones' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Cap\./).length).toBeGreaterThan(0);
  });
});
