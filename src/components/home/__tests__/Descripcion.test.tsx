import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Descripcion } from '@/components/home/Descripcion';

describe('Descripcion', () => {
  it('renders the Mangeki wordmark (accessible name "Mangeki")', () => {
    render(<Descripcion />);
    expect(screen.getByRole('img', { name: 'Mangeki' })).toBeInTheDocument();
  });

  it('renders the descriptive paragraph text', () => {
    render(<Descripcion />);
    expect(
      screen.getByText(/lectura de/i, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(/manga definitiva/i)).toBeInTheDocument();
  });
});
