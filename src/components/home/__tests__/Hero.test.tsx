import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Hero } from '@/components/home/Hero';

describe('Hero', () => {
  it('renders the hero banner image', () => {
    render(<Hero />);
    const img = screen.getByRole('img', { name: /universo Mangeki/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('hero2.webp'));
  });

  it('renders no carousel dot buttons', () => {
    render(<Hero />);
    expect(
      screen.queryByRole('button', { name: /Ir a la diapositiva/i }),
    ).not.toBeInTheDocument();
  });
});
