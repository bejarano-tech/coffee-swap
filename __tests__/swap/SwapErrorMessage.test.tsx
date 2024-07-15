import React from 'react';
import { render } from '@testing-library/react';
import { SwapErrorMessage } from '@/components/swap/SwapErrorMessage';
import { expect, test } from 'vitest';

test('renders SwapErrorMessage component correctly', () => {
  const errorTitle = 'Error Title';
  const errorDescription = 'Error Description';

  const { getByText } = render(
    <SwapErrorMessage title={errorTitle} description={errorDescription} />
  );

  expect(getByText(errorTitle)).toBeDefined();
  expect(getByText(errorDescription)).toBeDefined();
});
