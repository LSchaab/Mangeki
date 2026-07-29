import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';

function renderHeader() {
  return render(
    <AuthProvider>
      <LibraryProvider>
        <Header />
      </LibraryProvider>
    </AuthProvider>,
  );
}

describe('Header', () => {
  it('renders the Mangeki wordmark', () => {
    renderHeader();
    expect(screen.getByRole('img', { name: 'Mangeki' })).toBeInTheDocument();
  });

  it('renders the primary navigation links', () => {
    renderHeader();
    expect(
      screen.getByRole('link', { name: 'Nuevo & Popular' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nosotros' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Autores' })).toBeInTheDocument();
  });

  it('links to /login when logged out', () => {
    renderHeader();
    const loginLinks = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('href') === '/login');
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it('renders a "Buscar…" search input in the welcome bar', () => {
    renderHeader();
    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
  });
});
