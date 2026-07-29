import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';

describe('Home page', () => {
  it('composes the landing sections (Universo Mangeki + Tendencias)', () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <Home />
        </LibraryProvider>
      </AuthProvider>,
    );

    expect(screen.getByText('Universo')).toBeInTheDocument();
    expect(screen.getByText('Mangeki')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tendencias' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Newsletter/i }),
    ).toBeInTheDocument();
  });
});
