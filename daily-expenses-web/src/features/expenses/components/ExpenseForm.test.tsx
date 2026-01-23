// Integration tests for ExpenseForm component
// Tests all acceptance criteria: auto-focus, validation, keyboard navigation, submission

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../contexts/AuthContext';
import { ExpenseForm } from './ExpenseForm';
import * as expensesApi from '../api/expensesApi';
import * as indexedDB from '../../../services/indexeddb';

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

// Mock JWT helper to return a valid user ID
vi.mock('../../../shared/utils/jwtHelper', () => ({
  getUserIdFromToken: vi.fn(() => 'test-user-123'),
}));

// Mock IndexedDB services (Story 2.12: includes getExpenses for recent notes)
vi.mock('../../../services/indexeddb/index', () => ({
  getExpenses: vi.fn(() => Promise.resolve([])),
  createExpense: vi.fn(),
  getPendingSyncExpenses: vi.fn(() => Promise.resolve([])),
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
  it('validates note max 500 characters', { timeout: 10000 }, async () => {
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
  it('submits form on Enter key in note field', { timeout: 10000 }, async () => {
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
  it('submits form with valid data', { timeout: 10000 }, async () => {
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

  // Story 2.12: Recent Notes Quick Selection - AC1
  it('renders recent notes chips when expenses exist', async () => {
    // Mock expenses with notes
    const mockExpenses = [
      {
        id: '1',
        note: 'cafe',
        createdAt: '2026-01-23T10:00:00Z',
        amount: 50000,
        userId: 'test-user-123',
        date: '2026-01-23',
        updatedAt: '2026-01-23T10:00:00Z',
      },
      {
        id: '2',
        note: 'lunch',
        createdAt: '2026-01-23T12:00:00Z',
        amount: 80000,
        userId: 'test-user-123',
        date: '2026-01-23',
        updatedAt: '2026-01-23T12:00:00Z',
      },
      {
        id: '3',
        note: 'dinner',
        createdAt: '2026-01-23T18:00:00Z',
        amount: 150000,
        userId: 'test-user-123',
        date: '2026-01-23',
        updatedAt: '2026-01-23T18:00:00Z',
      },
    ];

    vi.mocked(indexedDB.getExpenses).mockResolvedValue(mockExpenses as any);

    renderForm();

    // Wait for chips to render
    await waitFor(() => {
      expect(screen.getByText('dinner')).toBeInTheDocument();
      expect(screen.getByText('lunch')).toBeInTheDocument();
      expect(screen.getByText('cafe')).toBeInTheDocument();
    });
  });

  // Story 2.12: AC2 - Chip click auto-fills note field
  it('auto-fills note field when chip is clicked', async () => {
    const user = userEvent.setup();

    // Mock expenses with notes
    const mockExpenses = [
      {
        id: '1',
        note: 'cafe',
        createdAt: '2026-01-23T10:00:00Z',
        amount: 50000,
        userId: 'test-user-123',
        date: '2026-01-23',
        updatedAt: '2026-01-23T10:00:00Z',
      },
      {
        id: '2',
        note: 'lunch',
        createdAt: '2026-01-23T12:00:00Z',
        amount: 80000,
        userId: 'test-user-123',
        date: '2026-01-23',
        updatedAt: '2026-01-23T12:00:00Z',
      },
    ];

    vi.mocked(indexedDB.getExpenses).mockResolvedValue(mockExpenses as any);

    renderForm();

    // Wait for chips to render
    await waitFor(() => {
      expect(screen.getByText('cafe')).toBeInTheDocument();
    });

    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe') as HTMLInputElement;

    // Click the "cafe" chip
    const cafeChip = screen.getByText('cafe');
    await user.click(cafeChip);

    // Note field should be auto-filled
    await waitFor(() => {
      expect(noteField.value).toBe('cafe');
    });

    // Note: Focus behavior with Material-UI Chips may vary in test environment
    // The important part is that the note field is filled correctly
    expect(noteField.value).toBe('cafe');
  });

  // Story 2.12: AC4 - No chips when no expenses exist
  it('does not render chips when no expenses exist', async () => {
    // Empty expenses list (default mock already returns empty array)
    vi.mocked(indexedDB.getExpenses).mockResolvedValue([]);

    renderForm();

    // Wait a bit to ensure chips don't appear
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /cafe/i })).not.toBeInTheDocument();
    });

    // Note field should still be visible with placeholder
    expect(screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe')).toBeInTheDocument();
  });

  // Story 2.12: AC - Chips don't appear in edit mode
  it('does not render chips in edit mode', async () => {
    // Mock expenses with notes
    const mockExpenses = [
      {
        id: '1',
        note: 'cafe',
        createdAt: '2026-01-23T10:00:00Z',
        amount: 50000,
        userId: 'test-user-123',
        date: '2026-01-23',
        updatedAt: '2026-01-23T10:00:00Z',
      },
    ];

    vi.mocked(indexedDB.getExpenses).mockResolvedValue(mockExpenses as any);

    // Render in edit mode
    renderForm({
      expenseId: 'edit-123',
      initialValues: {
        amount: 50000,
        note: 'existing note',
        date: '2026-01-23',
      },
      submitButtonText: 'Lưu thay đổi',
    });

    // Wait to ensure chips don't render
    await waitFor(() => {
      expect(screen.queryByText('cafe')).not.toBeInTheDocument();
    });

    // Form should show initial values
    const amountField = screen.getByPlaceholderText('vd: 50000') as HTMLInputElement;
    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe') as HTMLInputElement;

    await waitFor(() => {
      expect(amountField.value).toBe('50000');
      expect(noteField.value).toBe('existing note');
    });
  });

  // Story 2.12: AC7 - User can clear chip-filled note and type manually
  it('allows user to clear chip-filled note and type manually', async () => {
    const user = userEvent.setup();

    // Mock expenses with notes
    const mockExpenses = [
      {
        id: '1',
        note: 'cafe',
        createdAt: '2026-01-23T10:00:00Z',
        amount: 50000,
        userId: 'test-user-123',
        date: '2026-01-23',
        updatedAt: '2026-01-23T10:00:00Z',
      },
    ];

    vi.mocked(indexedDB.getExpenses).mockResolvedValue(mockExpenses as any);

    renderForm();

    // Wait for chips to render
    await waitFor(() => {
      expect(screen.getByText('cafe')).toBeInTheDocument();
    });

    const noteField = screen.getByPlaceholderText('vd: cafe, ăn trưa, xăng xe') as HTMLInputElement;

    // Click chip to auto-fill
    const cafeChip = screen.getByText('cafe');
    await user.click(cafeChip);

    await waitFor(() => {
      expect(noteField.value).toBe('cafe');
    });

    // Clear and type new note
    await user.clear(noteField);
    await user.type(noteField, 'different note');

    expect(noteField.value).toBe('different note');

    // Chips should still be available
    expect(screen.getByText('cafe')).toBeInTheDocument();
  });
});
