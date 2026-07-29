import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';
import { DEMO_ACCOUNT } from '@/lib/constants';
import LeerButton from '@/app/titulo/[id]/LeerButton';
import GuardarButton from '@/app/titulo/[id]/GuardarButton';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <LibraryProvider>{children}</LibraryProvider>
  </AuthProvider>
);

describe('LeerButton', () => {
  it('renders a disabled "Leer — Próximamente" button', () => {
    render(<LeerButton />, { wrapper });
    const button = screen.getByRole('button', { name: /Leer — Próximamente/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('GuardarButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logged out: shows a link "Inicia sesión para guardar" to /login', () => {
    render(<GuardarButton titleId="2" />, { wrapper });
    const link = screen.getByRole('link', {
      name: 'Inicia sesión para guardar',
    });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('logged in: toggles between "Guardar" and "✓ En tu biblioteca"', async () => {
    const user = userEvent.setup();
    // Seed a session so the provider hydrates a logged-in user.
    localStorage.setItem('mangeki.users', JSON.stringify([DEMO_ACCOUNT]));
    localStorage.setItem('mangeki.session', JSON.stringify(DEMO_ACCOUNT.id));

    render(<GuardarButton titleId="2" />, { wrapper });

    const saveBtn = await screen.findByRole('button', { name: 'Guardar' });
    await user.click(saveBtn);

    const savedBtn = await screen.findByRole('button', {
      name: '✓ En tu biblioteca',
    });
    expect(savedBtn).toBeInTheDocument();

    await user.click(savedBtn);
    expect(
      await screen.findByRole('button', { name: 'Guardar' }),
    ).toBeInTheDocument();
  });
});
