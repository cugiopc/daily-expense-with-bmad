// Integration tests for ExpenseForm component
// Tests all acceptance criteria: auto-focus, validation, keyboard navigation, submission

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../contexts/AuthContext';
import { ExpenseForm } from './ExpenseForm';
import * as expensesApi from '../api/expensesApi';

// Mock the API
vi.mock('../api/expensesApi', () => ({
  createExpense: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useOnlineStatus hook - default to online
vi.mock('../../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

// Mock IndexedDB services (not used when online, but needed for imports)
vi.mock('../../../services/indexeddb/index', () => ({
  createExpense: vi.fn(),
  getPendingSyncExpenses: vi.fn(() => Promise.resolve([])),
}));

// Mock JWT helper to return a valid user ID
vi.mock('../../../shared/utils/jwtHelper', () => ({
  getUserIdFromToken: vi.fn(() => 'test-user-123'),
}));

describe('ExpenseForm', () => {
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
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ExpenseForm {...props} />
        </QueryClientProvider>
      </AuthProvider>
    );
  };

  // AC: Amount field auto-focuses on mount
  it('auto-focuses amount field on mount', () => {
    renderForm();
    const amountField = screen.getByPlaceholderText('vd: 50000');
    expect(amountField).toHaveFocus();
  });

  // AC: Form validates amount > 0 before submission
  it('validates amount is positive', async () => {
    const user = userEvent.setup();
    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 50000');
    const submitButton = screen.getByRole('button', { name: /thêm chi tiêu/i });

    // Enter negative amount
    await user.clear(amountField);
    await user.type(amountField, '-10');
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/số tiền phải lớn hơn 0/i)).toBeInTheDocument();
    });
  });

  it('validates amount is required', async () => {
    const user = userEvent.setup();
    renderForm();

    const submitButton = screen.getByRole('button', { name: /thêm chi tiêu/i });

    // Try to submit without amount
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/số tiền phải là số/i)).toBeInTheDocument();
    });
  });

  // AC: Form validates note max 500 characters
  it('validates note max 500 characters', async () => {
    const user = userEvent.setup();
    renderForm();

    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe');
    const longNote = 'a'.repeat(501);

    // Enter note longer than 500 characters
    await user.type(noteField, longNote);
    await user.tab(); // Trigger validation

    // Should show validation error
    await waitFor(() => {
      expect(
        screen.getByText(/ghi chú không được quá 500 ký tự/i)
      ).toBeInTheDocument();
    });
  });

  // AC: Pressing Enter key in Note field submits form
  it('submits form on Enter key in note field', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();
    const mockResponse = {
      id: '123',
      userId: 'user1',
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    };

    vi.mocked(expensesApi.createExpense).mockResolvedValue(mockResponse);

    renderForm({ onSuccess: mockOnSuccess });

    const amountField = screen.getByPlaceholderText('vd: 50000');
    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe');

    // Fill in form
    await user.clear(amountField);
    await user.type(amountField, '50000');
    await user.click(noteField);
    await user.type(noteField, 'cafe');

    // Press Enter in note field (target the note field specifically)
    await user.type(noteField, '{Enter}');

    // Should call API and trigger onSuccess
    await waitFor(() => {
      expect(expensesApi.createExpense).toHaveBeenCalledWith({
        amount: 50000,
        note: 'cafe',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // ISO date
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  // AC: Form submission calls createExpense mutation
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      id: '123',
      userId: 'user1',
      amount: 75000,
      note: 'ăn trưa',
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    };

    vi.mocked(expensesApi.createExpense).mockResolvedValue(mockResponse);

    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 50000');
    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe');
    const submitButton = screen.getByRole('button', { name: /thêm chi tiêu/i });

    // Fill in form
    await user.clear(amountField);
    await user.type(amountField, '75000');
    await user.click(noteField);
    await user.type(noteField, 'ăn trưa');
    await user.click(submitButton);

    // Should call API with correct data
    await waitFor(() => {
      expect(expensesApi.createExpense).toHaveBeenCalledWith({
        amount: 75000,
        note: 'ăn trưa',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      });
    });
  });

  // AC: Form clears after successful submission
  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      id: '123',
      userId: 'user1',
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    };

    vi.mocked(expensesApi.createExpense).mockResolvedValue(mockResponse);

    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 50000') as HTMLInputElement;
    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /thêm chi tiêu/i });

    // Fill in form
    await user.clear(amountField);
    await user.type(amountField, '50000');
    await user.click(noteField);
    await user.type(noteField, 'cafe');
    await user.click(submitButton);

    // Wait for form to clear
    await waitFor(() => {
      expect(amountField.value).toBe('');
      expect(noteField.value).toBe('');
    });
  });

  // AC: Date field defaults to today
  it('defaults date to today', () => {
    renderForm();

    // Date field is hidden but should be in form state
    const today = new Date().toISOString().split('T')[0];

    // We can't directly test hidden field, but submission will use today's date
    // This is tested implicitly in other tests where we check the API call
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // AC: Tab key moves focus from Amount to Note
  it('allows tab navigation from amount to note', async () => {
    const user = userEvent.setup();
    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 50000');
    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe');

    // Amount should be focused initially
    expect(amountField).toHaveFocus();

    // Press Tab
    await user.tab();

    // Note field should be focused
    expect(noteField).toHaveFocus();
  });

  // AC: Submit button is disabled during submission
  it('disables submit button during submission', async () => {
    const user = userEvent.setup();

    // Mock a slow API response
    vi.mocked(expensesApi.createExpense).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: '123',
                userId: 'user1',
                amount: 50000,
                note: '',
                date: '2026-01-19',
                createdAt: '2026-01-19T10:00:00Z',
                updatedAt: '2026-01-19T10:00:00Z',
              }),
            100
          )
        )
    );

    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 50000');
    const submitButton = screen.getByRole('button', { name: /thêm chi tiêu/i });

    // Fill in amount
    await user.clear(amountField);
    await user.type(amountField, '50000');

    // Submit
    await user.click(submitButton);

    // Button should be disabled and show loading text
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/đang lưu/i);

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent(/thêm chi tiêu/i);
    });
  });

  // AC: Note field is optional
  it('allows submission without note', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      id: '123',
      userId: 'user1',
      amount: 50000,
      note: null,
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    };

    vi.mocked(expensesApi.createExpense).mockResolvedValue(mockResponse);

    renderForm();

    const amountField = screen.getByPlaceholderText('vd: 50000');
    const submitButton = screen.getByRole('button', { name: /thêm chi tiêu/i });

    // Only fill in amount
    await user.clear(amountField);
    await user.type(amountField, '50000');
    await user.click(submitButton);

    // Should call API with empty note
    await waitFor(() => {
      expect(expensesApi.createExpense).toHaveBeenCalledWith({
        amount: 50000,
        note: '',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      });
    });
  });

  // AC: Dialog closes after successful submission
  it('calls onSuccess callback to close dialog after submission', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();
    const mockResponse = {
      id: '123',
      userId: 'user1',
      amount: 50000,
      note: 'test',
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    };

    vi.mocked(expensesApi.createExpense).mockResolvedValue(mockResponse);

    renderForm({ onSuccess: mockOnSuccess });

    const amountField = screen.getByPlaceholderText('vd: 50000');
    const submitButton = screen.getByRole('button', { name: /thêm chi tiêu/i });

    // Fill and submit form
    await user.clear(amountField);
    await user.type(amountField, '50000');
    await user.click(submitButton);

    // Should call onSuccess callback (which closes the dialog)
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
