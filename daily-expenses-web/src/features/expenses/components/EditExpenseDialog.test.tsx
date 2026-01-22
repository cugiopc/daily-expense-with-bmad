// Tests for EditExpenseDialog component
// Story 2.8: Edit Expense Functionality

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditExpenseDialog } from './EditExpenseDialog';
import type { Expense } from '../types/expense.types';

// Mock ExpenseForm
vi.mock('./ExpenseForm', () => ({
  ExpenseForm: ({ initialValues, expenseId, submitButtonText }: any) => (
    <div data-testid="expense-form">
      <div>Expense ID: {expenseId}</div>
      <div>Amount: {initialValues.amount}</div>
      <div>Note: {initialValues.note}</div>
      <div>Date: {initialValues.date}</div>
      <div>Button: {submitButtonText}</div>
    </div>
  ),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('EditExpenseDialog', () => {
  const mockExpense: Expense = {
    id: '1',
    userId: 'user-1',
    amount: 50000,
    note: 'test expense',
    date: '2026-01-15T10:00:00Z',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  };

  it('should render dialog with pre-filled values', () => {
    render(
      <EditExpenseDialog 
        open={true} 
        expense={mockExpense} 
        onClose={vi.fn()} 
      />,
      { wrapper }
    );

    expect(screen.getByText('Sửa chi tiêu')).toBeInTheDocument();
    expect(screen.getByTestId('expense-form')).toBeInTheDocument();
    expect(screen.getByText('Amount: 50000')).toBeInTheDocument();
    expect(screen.getByText('Note: test expense')).toBeInTheDocument();
    expect(screen.getByText('Date: 2026-01-15')).toBeInTheDocument();
    expect(screen.getByText('Button: Lưu thay đổi')).toBeInTheDocument();
  });

  it('should not render when expense is null', () => {
    const { container } = render(
      <EditExpenseDialog 
        open={true} 
        expense={null} 
        onClose={vi.fn()} 
      />,
      { wrapper }
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show cancel button', () => {
    render(
      <EditExpenseDialog 
        open={true} 
        expense={mockExpense} 
        onClose={vi.fn()} 
      />,
      { wrapper }
    );

    expect(screen.getByText('Hủy')).toBeInTheDocument();
  });
});
