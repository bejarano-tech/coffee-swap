import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { SwapButton } from '@/components/swap/SwapButton';

const handleSwapMock = vi.fn();

afterEach(cleanup);

test('renders SwapButton component correctly', () => {
  const { getByText } = render(
    <SwapButton handleSwap={handleSwapMock} disabled={false} loading={false} />
  );

  expect(getByText('Swap')).toBeDefined();
});

test('calls handleSwap function on button click', () => {
  const { getByText } = render(
    <SwapButton handleSwap={handleSwapMock} disabled={false} loading={false} />
  );

  // Simula un clic en el botón
  fireEvent.click(getByText('Swap'));

  // Verifica que la función handleSwap haya sido llamada una vez
  expect(handleSwapMock).toHaveBeenCalledTimes(1);
});

test('disables the button when disabled prop is true', () => {
  const { getByText } = render(
    <SwapButton handleSwap={handleSwapMock} disabled={true} loading={false} />
  );

  // Verifica que el botón esté deshabilitado
  const button = getByText('Swap');
  expect(button).toHaveProperty('disabled', true);
});

test('displays loading text when loading prop is true', () => {
  const { getByText } = render(
    <SwapButton handleSwap={handleSwapMock} disabled={false} loading={true} />
  );

  // Verifica que el texto "Loading..." esté presente mientras está cargando
  expect(getByText('Loading...')).toBeDefined();
});
