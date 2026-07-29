import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NosotrosPage from '@/app/nosotros/page';
import LegalPage from '@/app/legal/page';
import ContactoPage from '@/app/contacto/page';
import NotFound from '@/app/not-found';

describe('Static content pages', () => {
  it('Nosotros renders its heading', () => {
    render(<NosotrosPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nosotros' }),
    ).toBeInTheDocument();
  });

  it('Legal renders its heading and the localStorage privacy note', () => {
    render(<LegalPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Legal' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/localStorage/i)).toBeInTheDocument();
  });

  it('Contacto renders its heading and references the Vaiven portfolio', () => {
    render(<ContactoPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Contacto' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/lourdesschaab\.com/i)).toBeInTheDocument();
  });

  it('not-found renders 404 and a link back home', () => {
    render(<NotFound />);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Volver al inicio' });
    expect(link).toHaveAttribute('href', '/');
  });
});
