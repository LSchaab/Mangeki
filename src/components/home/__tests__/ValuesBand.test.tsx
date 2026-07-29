import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ValuesBand } from '@/components/home/ValuesBand';

describe('ValuesBand', () => {
  it('renders the three value words', () => {
    render(<ValuesBand />);
    expect(screen.getByText('ENTRETENIMIENTO')).toBeInTheDocument();
    expect(screen.getByText('EMOCIÓN')).toBeInTheDocument();
    expect(screen.getByText('DINAMISMO')).toBeInTheDocument();
  });
});
