import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Hello } from '@/components/Hello';

describe('smoke', () => {
  it('renders a trivial component', () => {
    render(<Hello name="Mangeki" />);
    expect(screen.getByText('Hola, Mangeki')).toBeInTheDocument();
  });
});
