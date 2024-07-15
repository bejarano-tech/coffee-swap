import React from 'react';
import { render, fireEvent, getByRole, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { SwapSelectTokenModal } from '@/components/swap/SwapSelectTokenModal';

afterEach(cleanup);

// Mock de las funciones necesarias para las pruebas
const mockTokens = [
  { img: '/path/to/image1.png', name: 'Token 1', symbol: 'TKN1', address: '0x', decimals: 18 },
  { img: '/path/to/image2.png', name: 'Token 2', symbol: 'TKN2', address: '0x', decimals: 18 },
];
const mockSetIsOpen = vi.fn();
const mockModifyToken = vi.fn();

test('renders SwapSelectTokenModal component correctly', () => {
  const { getByText, getByAltText } = render(
    <SwapSelectTokenModal
      isOpen={true}
      setIsOpen={mockSetIsOpen}
      tokens={mockTokens}
      modifyToken={mockModifyToken}
    />
  );

  // Verifica que el título "Select a Token" esté presente en el modal
  expect(getByText('Select a Token')).toBeDefined();

  // Verifica que las imágenes y los textos de los tokens estén presentes
  mockTokens.forEach((token) => {
    expect(getByAltText(token.symbol)).toBeDefined();
    expect(getByText(token.name)).toBeDefined();
    expect(getByText(token.symbol)).toBeDefined();
  });
});

test('calls setIsOpen(false) when modal is closed', () => {
  const { getByRole } = render(
    <SwapSelectTokenModal
      isOpen={true}
      setIsOpen={mockSetIsOpen}
      tokens={mockTokens}
      modifyToken={mockModifyToken}
    />
  );

  // Simula un clic en el botón de cerrar el modal
  fireEvent.click(getByRole('button'));

  // Verifica que setIsOpen(false) haya sido llamado una vez
  expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
  expect(mockSetIsOpen).toHaveBeenCalledWith(false);
});

test('calls modifyToken(index) when a token is selected', () => {
  const { getByText } = render(
    <SwapSelectTokenModal
      isOpen={true}
      setIsOpen={mockSetIsOpen}
      tokens={mockTokens}
      modifyToken={mockModifyToken}
    />
  );

  // Simula un clic en el primer token
  fireEvent.click(getByText(mockTokens[0].name));

  // Verifica que modifyToken(index) haya sido llamado una vez con el índice correcto
  expect(mockModifyToken).toHaveBeenCalledTimes(1);
  expect(mockModifyToken).toHaveBeenCalledWith(0);
});
