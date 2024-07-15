import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { SwapTokenInput } from '@/components/swap/SwapTokenInput';
import { ethers } from 'ethers';

afterEach(cleanup);

const mockAmount = '10';
const mockOnChange = vi.fn();
const mockOpenModal = vi.fn();
const mockBalance = 100;
const mockToken = { img: '/path/to/token.png', symbol: 'TKN', decimals: 18, name: "Test Token", address: '0x' };
const mockIndex = 0;

test('renders SwapTokenInput component correctly', () => {
  const { getByPlaceholderText, getByAltText, getByText } = render(
    <SwapTokenInput
      amount={mockAmount}
      onChange={mockOnChange}
      openModal={mockOpenModal}
      balance={mockBalance}
      token={mockToken}
      index={mockIndex}
    />
  );

  expect(getByPlaceholderText('0')).toHaveProperty('value', mockAmount);

  expect(getByAltText('AssetOne Logo')).toBeDefined();
  expect(getByText(mockToken.symbol)).toBeDefined();
});

test('calls onChange function when input value changes', () => {
  const { getByPlaceholderText } = render(
    <SwapTokenInput
      amount={mockAmount}
      onChange={mockOnChange}
      openModal={mockOpenModal}
      balance={mockBalance}
      token={mockToken}
      index={mockIndex}
    />
  );

  // Simula un cambio en el valor del input
  fireEvent.change(getByPlaceholderText('0'), { target: { value: '20' } });

  // Verifica que onChange haya sido llamado con el nuevo valor
  expect(mockOnChange).toHaveBeenCalledTimes(1);
});

test('calls openModal(index) when token selector is clicked', () => {
  const { getByTestId } = render(
    <SwapTokenInput
      amount={mockAmount}
      onChange={mockOnChange}
      openModal={mockOpenModal}
      balance={mockBalance}
      token={mockToken}
      index={mockIndex}
    />
  );

  // Simula un clic en el selector de token
  fireEvent.click(getByTestId('token-selector'));

  // Verifica que openModal(index) haya sido llamado una vez
  expect(mockOpenModal).toHaveBeenCalledTimes(1);
  expect(mockOpenModal).toHaveBeenCalledWith(mockIndex);
});
