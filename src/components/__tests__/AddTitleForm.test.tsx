import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { AddTitleForm } from '@/components/AddTitleForm';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LibraryProvider, useLibrary } from '@/context/LibraryContext';

// Harness: logs in the demo user on mount, then renders the form plus a live
// count of custom titles so tests can assert the count increments.
function Harness() {
  const { user, login } = useAuth();
  const { customTitles } = useLibrary();
  return (
    <div>
      {!user && (
        <button type="button" onClick={() => login('otaku123', 'demo1234')}>
          login
        </button>
      )}
      <p>custom-count: {customTitles.length}</p>
      <AddTitleForm />
    </div>
  );
}

function renderForm() {
  return render(
    <AuthProvider>
      <LibraryProvider>
        <Harness />
      </LibraryProvider>
    </AuthProvider>,
  );
}

async function loginDemo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'login' }));
}

describe('AddTitleForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a validation error when submitting empty title/author', async () => {
    const user = userEvent.setup();
    renderForm();
    await loginDemo(user);

    await user.click(screen.getByRole('button', { name: 'Añadir título' }));

    expect(
      await screen.findByText('Título y autor son obligatorios.'),
    ).toBeInTheDocument();
    expect(screen.getByText('custom-count: 0')).toBeInTheDocument();
  });

  it('adds a custom title and shows a success message on a valid submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await loginDemo(user);

    await user.type(screen.getByLabelText('Título'), 'Mi Manga Original');
    await user.type(screen.getByLabelText('Autor'), 'Autora Demo');
    await user.type(
      screen.getByLabelText('Géneros'),
      'accion, romance',
    );

    await user.click(screen.getByRole('button', { name: 'Añadir título' }));

    expect(
      await screen.findByText('Añadido a tu biblioteca.'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('custom-count: 1')).toBeInTheDocument(),
    );
    // form clears on success
    expect(screen.getByLabelText('Título')).toHaveValue('');
    expect(screen.getByLabelText('Autor')).toHaveValue('');
  });
});
