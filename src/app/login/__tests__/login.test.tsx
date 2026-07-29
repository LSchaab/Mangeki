import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import LoginPage from '@/app/login/page';
import RegistroPage from '@/app/registro/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the demo disclaimer with otaku123 and demo1234', () => {
    render(<LoginPage />, { wrapper });
    const disclaimer = screen.getByText(/Esto es una demo/i);
    expect(disclaimer).toHaveTextContent('otaku123');
    expect(disclaimer).toHaveTextContent('demo1234');
  });

  it('shows the H1 "Iniciar sesión" and a link to /registro', () => {
    render(<LoginPage />, { wrapper });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Iniciar sesión' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Regístrate/ })).toHaveAttribute(
      'href',
      '/registro',
    );
  });

  it('shows a Spanish error on invalid login', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    await user.type(screen.getByLabelText('Usuario'), 'otaku123');
    await user.type(screen.getByLabelText('Contraseña'), 'wrongpass');
    await user.click(
      screen.getByRole('button', { name: 'Iniciar sesión' }),
    );

    expect(
      await screen.findByText('Usuario o contraseña inválidos.'),
    ).toBeInTheDocument();
  });

  it('logs in valid credentials without showing an error', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    await user.type(screen.getByLabelText('Usuario'), 'otaku123');
    await user.type(screen.getByLabelText('Contraseña'), 'demo1234');
    await user.click(
      screen.getByRole('button', { name: 'Iniciar sesión' }),
    );

    expect(
      screen.queryByText('Usuario o contraseña inválidos.'),
    ).not.toBeInTheDocument();
  });
});

describe('RegistroPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the H1 "Registro" and labeled Usuario/Email/Contraseña inputs', () => {
    render(<RegistroPage />, { wrapper });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Registro' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Inicia sesión/ }),
    ).toHaveAttribute('href', '/login');
  });

  it('shows an error when signing up with an existing username', async () => {
    const user = userEvent.setup();
    render(<RegistroPage />, { wrapper });

    await user.type(screen.getByLabelText('Usuario'), 'otaku123');
    await user.type(screen.getByLabelText('Email'), 'x@mangeki.app');
    await user.type(screen.getByLabelText('Contraseña'), 'clave1234');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Ese usuario ya existe.')).toBeInTheDocument();
  });
});
