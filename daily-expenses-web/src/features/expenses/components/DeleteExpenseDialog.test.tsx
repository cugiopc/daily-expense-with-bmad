// Tests for DeleteExpenseDialog component
// Story 2.9: Delete Expense with Swipe Action
// Review Follow-up: HIGH - Create unit tests for confirmation dialog

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteExpenseDialog } from './DeleteExpenseDialog';
import type { Expense } from '../types/expense.types';

describe('DeleteExpenseDialog', () => {
  const mockExpense: Expense = {
    id: 'expense-123',
    userId: 'user-1',
    amount: 50000,
    note: 'Cà phê sáng',
    date: '2026-01-22T03:30:00Z',
    createdAt: '2026-01-22T03:30:00Z',
    updatedAt: '2026-01-22T03:30:00Z',
  };

  /**
   * Test 1/5: Render with expense details
   * Verifies dialog shows amount, note, and warning message
   */
  it('should render with expense details', () => {
    render(
      <DeleteExpenseDialog
        open={true}
        expense={mockExpense}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    // Check dialog title
    expect(screen.getByText('Xóa chi tiêu này?')).toBeInTheDocument();

    // Check expense amount and note are displayed
    expect(screen.getByText(/50\.000 ₫/)).toBeInTheDocument();
    expect(screen.getByText(/Cà phê sáng/)).toBeInTheDocument();

    // Check warning message
    expect(screen.getByText('Hành động này không thể hoàn tác.')).toBeInTheDocument();

    // Check buttons are present
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument();
  });

  /**
   * Test 2/5: Call onConfirm when Delete clicked
   * Verifies the onConfirm callback is fired when user clicks Delete button
   */
  it('should call onConfirm when Delete clicked', () => {
    const mockOnConfirm = vi.fn();

    render(
      <DeleteExpenseDialog
        open={true}
        expense={mockExpense}
        onClose={vi.fn()}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Xóa' });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  /**
   * Test 3/5: Call onClose when Cancel clicked
   * Verifies the onClose callback is fired when user clicks Cancel button
   */
  it('should call onClose when Cancel clicked', () => {
    const mockOnClose = vi.fn();

    render(
      <DeleteExpenseDialog
        open={true}
        expense={mockExpense}
        onClose={mockOnClose}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Hủy' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Test 4/5: Disable buttons during deletion
   * Verifies both buttons are disabled and Delete button shows "Đang xóa..." text
   */
  it('should disable buttons during deletion', () => {
    render(
      <DeleteExpenseDialog
        open={true}
        expense={mockExpense}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Hủy' });
    const deleteButton = screen.getByRole('button', { name: 'Đang xóa...' });

    // Both buttons should be disabled
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();

    // Delete button text changes to loading state
    expect(screen.getByText('Đang xóa...')).toBeInTheDocument();
  });

  /**
   * Test 5/5: Don't render when expense is null
   * Verifies component returns null when no expense is provided (prevents crash)
   */
  it('should not render when expense is null', () => {
    const { container } = render(
      <DeleteExpenseDialog
        open={true}
        expense={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    // Component should return null, so container should be empty
    expect(container.firstChild).toBeNull();
  });

  /**
   * Bonus Test: Show "Không có ghi chú" when note is empty
   * Edge case: Expense with null or empty note
   */
  it('should show "Không có ghi chú" when note is empty', () => {
    const expenseWithoutNote: Expense = {
      ...mockExpense,
      note: null,
    };

    render(
      <DeleteExpenseDialog
        open={true}
        expense={expenseWithoutNote}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    expect(screen.getByText(/Không có ghi chú/)).toBeInTheDocument();
  });
});
