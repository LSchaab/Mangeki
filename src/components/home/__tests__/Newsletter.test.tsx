import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Newsletter } from '@/components/home/Newsletter';

describe('Newsletter', () => {
  it('renders the four category checkboxes', () => {
    render(<Newsletter />);
    expect(screen.getByRole('checkbox', { name: 'Cómic' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Manga' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Manhwa' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Manhua' })).toBeInTheDocument();
  });

  it('shows an error when submitting with an invalid email', async () => {
    const user = userEvent.setup();
    render(<Newsletter />);

    await user.type(screen.getByLabelText(/nombre/i), 'Ana');
    await user.type(screen.getByLabelText(/e-mail/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByText(/correo válido/i)).toBeInTheDocument();
    expect(
      screen.queryByText('¡Gracias por suscribirte!'),
    ).not.toBeInTheDocument();
  });

  it('shows an error when the name is missing', async () => {
    const user = userEvent.setup();
    render(<Newsletter />);

    await user.type(screen.getByLabelText(/e-mail/i), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByText(/nombre es obligatorio/i)).toBeInTheDocument();
  });

  it('shows a success message on a valid submit and clears the fields', async () => {
    const user = userEvent.setup();
    render(<Newsletter />);

    const nombre = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    const email = screen.getByLabelText(/e-mail/i) as HTMLInputElement;

    await user.type(nombre, 'Ana');
    await user.type(email, 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      screen.getByText('¡Gracias por suscribirte!'),
    ).toBeInTheDocument();
    expect(nombre.value).toBe('');
    expect(email.value).toBe('');
  });
});
