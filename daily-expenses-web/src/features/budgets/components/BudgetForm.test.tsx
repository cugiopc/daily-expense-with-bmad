// Integration tests for BudgetForm component
// Tests all acceptance criteria from Story 3.2: validation, submission, UPSERT logic

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetForm } from './BudgetForm';
import * as budgetsApi from '../api/budgetsApi';

// Mock the budgetsApi
vi.mock('../api/budgetsApi', () => ({
  createBudget: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BudgetForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BudgetForm {...props} />
      </QueryClientProvider>
    );
  };

  // AC: Form renders with amount input and submit button
  it('renders amount input and submit button', () => {
    renderForm();

    expect(screen.getByLabelText(/ngân sách/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lưu ngân sách/i })).toBeInTheDocument();
  });

  // AC: Amount field auto-focuses on mount
  it('auto-focuses amount field on mount', () => {
    renderForm();
    const amountField = screen.getByPlaceholderText('vd: 15000000');
    expect(amountField).toHaveFocus();
  });

  // AC 4: Shows error when amount is 0 or negative
  it('shows error when amount is 0', async () => {
    const user = userEvent.setup();
    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 15000000');
    const submitButton = screen.getByRole('button', { name: /lưu ngân sách/i });

    // Enter zero amount
    await user.clear(amountField);
    await user.type(amountField, '0');
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/số tiền phải lớn hơn 0/i)).toBeInTheDocument();
    });
  });

  it('shows error when amount is negative', async () => {
    const user = userEvent.setup();
    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 15000000');
    const submitButton = screen.getByRole('button', { name: /lưu ngân sách/i });

    // Enter negative amount
    await user.clear(amountField);
    await user.type(amountField, '-1000');
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/số tiền phải lớn hơn 0/i)).toBeInTheDocument();
    });
  });

  // AC: Shows error when amount is empty
  it('shows error when amount is empty', async () => {
    const user = userEvent.setup();
    renderForm();

    const submitButton = screen.getByRole('button', { name: /lưu ngân sách/i });

    // Click submit without entering amount
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/số tiền phải là số/i)).toBeInTheDocument();
    });
  });

  // AC 2 & 3: Submits form with valid amount (15000000)
  it('submits form with valid amount', async () => {
    const user = userEvent.setup({ delay: null }); // Reduce timing delays
    const mockCreateBudget = vi.mocked(budgetsApi.createBudget);
    mockCreateBudget.mockResolvedValueOnce({
      id: 'test-budget-id',
      userId: 'test-user-id',
      month: '2026-01-01',
      amount: 15000000,
      createdAt: new Date().toISOString(),
    });

    const onSuccess = vi.fn();
    renderForm({ onSuccess });

    const amountField = screen.getByPlaceholderText('vd: 15000000') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /lưu ngân sách/i });

    // Enter valid amount
    await user.clear(amountField);
    await user.type(amountField, '15000000');

    // Verify input has correct value before submission
    expect(amountField.value).toBe('15000000');

    // Submit the form
    await user.click(submitButton);

    // Wait for mutation to complete
    await waitFor(
      () => {
        expect(mockCreateBudget).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 }
    );

    // Verify API called with correct data (check first argument only)
    const firstCallFirstArg = mockCreateBudget.mock.calls[0][0];
    expect(firstCallFirstArg).toMatchObject({
      amount: 15000000,
      month: expect.stringMatching(/\d{4}-\d{2}-01/),
    });
  });

  // AC: Button is disabled while submitting
  it('disables button while submitting', async () => {
    const user = userEvent.setup();
    const mockCreateBudget = vi.mocked(budgetsApi.createBudget);

    // Create a promise that we can control
    let resolveCreate: (value: any) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    mockCreateBudget.mockReturnValue(createPromise as any);

    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 15000000');
    const submitButton = screen.getByRole('button', { name: /lưu ngân sách/i });

    // Enter valid amount and submit
    await user.clear(amountField);
    await user.type(amountField, '15000000');
    await user.click(submitButton);

    // Button should be disabled while submitting
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/đang lưu/i);
    });

    // Resolve the promise to complete the submission
    resolveCreate!({
      id: 'test-id',
      userId: 'test-user',
      month: '2026-01-01',
      amount: 15000000,
      createdAt: new Date().toISOString(),
    });

    // Button should be enabled again
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  // AC 6: Success callback is called after submission
  it('calls success callback after submission', async () => {
    const user = userEvent.setup();
    const mockCreateBudget = vi.mocked(budgetsApi.createBudget);
    mockCreateBudget.mockResolvedValue({
      id: 'test-budget-id',
      userId: 'test-user-id',
      month: '2026-01-01',
      amount: 18000000,
      createdAt: new Date().toISOString(),
    });

    const onSuccess = vi.fn();
    renderForm({ onSuccess });

    const amountField = screen.getByPlaceholderText('vd: 15000000');
    const submitButton = screen.getByRole('button', { name: /lưu ngân sách/i });

    // Enter valid amount and submit
    await user.clear(amountField);
    await user.type(amountField, '18000000');
    await user.click(submitButton);

    // Should call onSuccess after successful submission
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  // AC: Pre-fills form with existing budget amount
  it('pre-fills form with initial amount', () => {
    renderForm({ initialAmount: 20000000 });

    const amountField = screen.getByPlaceholderText('vd: 15000000') as HTMLInputElement;
    expect(amountField.value).toBe('20000000');
  });
});
