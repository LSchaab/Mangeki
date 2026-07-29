import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Hero } from '@/components/home/Hero';

describe('Hero', () => {
  it('renders the "Universo Mangeki" heading', () => {
    render(<Hero />);
    expect(
      screen.getByRole('heading', { name: /Universo Mangeki/i }),
    ).toBeInTheDocument();
  });

  it('renders the AppBadges (Google Play / App Store)', () => {
    render(<Hero />);
    expect(screen.getByText('Google Play')).toBeInTheDocument();
    expect(screen.getByText('App Store')).toBeInTheDocument();
  });

  it('renders the hero collage image', () => {
    render(<Hero />);
    const img = screen.getByRole('img', { name: /Universo Mangeki/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('hero_image.png'));
  });

  it('renders one dot button per slide with accessible labels', () => {
    render(<Hero />);
    const dots = screen.getAllByRole('button', {
      name: /Ir a la diapositiva \d+/i,
    });
    expect(dots.length).toBeGreaterThanOrEqual(3);
    dots.forEach((dot, i) => {
      expect(dot).toHaveAccessibleName(`Ir a la diapositiva ${i + 1}`);
    });
  });

  it('marks the first dot as current by default', () => {
    render(<Hero />);
    const firstDot = screen.getByRole('button', {
      name: 'Ir a la diapositiva 1',
    });
    expect(firstDot).toHaveAttribute('aria-current', 'true');
  });

  it('sets aria-current on a dot when clicked', async () => {
    const user = userEvent.setup();
    render(<Hero />);
    const secondDot = screen.getByRole('button', {
      name: 'Ir a la diapositiva 2',
    });
    expect(secondDot).toHaveAttribute('aria-current', 'false');
    await user.click(secondDot);
    expect(secondDot).toHaveAttribute('aria-current', 'true');
    expect(
      screen.getByRole('button', { name: 'Ir a la diapositiva 1' }),
    ).toHaveAttribute('aria-current', 'false');
  });
});
