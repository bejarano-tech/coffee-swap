import React from 'react';
import { render, fireEvent, getByTestId } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { SwapSwitchTokensButton } from '@/components/swap/SwapSwitchTokensButton';

test('calls switchTokens function on button click', () => {
  const switchTokensMock = vi.fn();

  const { getByTestId } = render(
    <SwapSwitchTokensButton switchTokens={switchTokensMock} />
  );

  fireEvent.click(getByTestId('token-button'));

  expect(switchTokensMock).toHaveBeenCalledTimes(1);
});
