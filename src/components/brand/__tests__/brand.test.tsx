import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Wordmark } from '@/components/brand/Wordmark';
import { Avatar } from '@/components/brand/Avatar';
import { AppBadges } from '@/components/brand/AppBadges';
import { SocialIcons } from '@/components/brand/SocialIcons';

describe('Wordmark', () => {
  it('exposes the accessible name "Mangeki"', () => {
    render(<Wordmark />);
    expect(screen.getByRole('img', { name: 'Mangeki' })).toBeInTheDocument();
  });

  it('renders the real mangeki logo asset', () => {
    render(<Wordmark />);
    const img = screen.getByRole('img', { name: 'Mangeki' });
    expect(img).toHaveAttribute('src', expect.stringContaining('mangeki_logo.svg'));
  });

  it('applies brightness-0 invert filter for the white variant', () => {
    const { container } = render(<Wordmark variant="white" />);
    const img = container.querySelector('img');
    expect(img?.className).toContain('brightness-0');
    expect(img?.className).toContain('invert');
  });
});

describe('Avatar', () => {
  it('defaults to the profile icon asset', () => {
    render(<Avatar alt="Otaku 123" />);
    const img = screen.getByRole('img', { name: 'Otaku 123' });
    expect(img).toHaveAttribute('src', expect.stringContaining('profile_icon.svg'));
  });

  it('accepts a custom src', () => {
    render(<Avatar src="/brand/custom.png" alt="Custom" />);
    const img = screen.getByRole('img', { name: 'Custom' });
    expect(img).toHaveAttribute('src', expect.stringContaining('custom.png'));
  });
});

describe('AppBadges', () => {
  it('renders the Google Play and App Store store names', () => {
    render(<AppBadges />);
    expect(screen.getByText('Google Play')).toBeInTheDocument();
    expect(screen.getByText('App Store')).toBeInTheDocument();
  });
});

describe('SocialIcons', () => {
  it('renders Facebook, Instagram and X items with accessible labels', () => {
    render(<SocialIcons />);
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('X')).toBeInTheDocument();
  });
});
