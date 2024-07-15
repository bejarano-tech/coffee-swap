import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { SwapSettings } from '@/components/swap/SwapSettings';

// Mock del contexto de slippage para las pruebas
vi.mock('@/contexts/SlippageContext', () => ({
  useSlippageContext: vi.fn(() => ({
    slippage: '0.5',
    handleSlippageChange: vi.fn(),
  })),
}));

test('renders SwapSettings component correctly', () => {
  const { getByText, getByRole } = render(<SwapSettings />);
  fireEvent.click(getByRole('button'));
  expect(getByText('Slippage Tolerance')).toBeDefined();
});
