import React from 'react';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { SwapHeader } from '@/components/swap/SwapHeader';
import { SlippageProvider } from '@/contexts/SlippageContext';

test('renders SwapHeader component correctly', () => {
  const { getByText } = render(<SlippageProvider><SwapHeader /></SlippageProvider>);

  // Verifica que el texto "Swap" esté presente en el encabezado
  expect(getByText('Swap')).toBeDefined();

});