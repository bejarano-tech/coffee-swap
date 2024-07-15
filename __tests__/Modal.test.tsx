import { afterEach, expect, test } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react';
import { Modal } from '@/components/Modal';
import { vi } from 'vitest'

afterEach(cleanup);

test('renders modal when isOpen is true', () => {
  const handleClose = vi.fn();
  const { getByText } = render(
    <Modal isOpen={true} onClose={handleClose} title="Test Modal">
      <p>Modal Content</p>
    </Modal>
  );

  expect(getByText('Test Modal')).toBeDefined();
  expect(getByText('Modal Content')).toBeDefined();
});

test('does not render modal when isOpen is false', () => {
  const handleClose = vi.fn();
  const { queryByText } = render(
    <Modal isOpen={false} onClose={handleClose} title="Test Modal">
      <p>Modal Content</p>
    </Modal>
  );

  expect(queryByText('Test Modal')).toBe(null);
  expect(queryByText('Modal Content')).toBe(null);
});

test('calls onClose when close button is clicked', () => {
  const handleClose = vi.fn();
  const { getByRole } = render(
    <Modal isOpen={true} onClose={handleClose} title="Test Modal">
      <p>Modal Content</p>
    </Modal>
  );

  fireEvent.click(getByRole('button'));
  expect(handleClose).toHaveBeenCalledTimes(1);
});
