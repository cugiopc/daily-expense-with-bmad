// Tests for useDeleteExpense hook
// Story 2.9: Delete Expense with Swipe Action
// Review Follow-up: HIGH - Create unit tests for optimistic delete mutation

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteExpense } from './useDeleteExpense';
import * as expensesApi from '../api/expensesApi';
import toast from 'react-hot-toast';
import type { Expense } from '../types/expense.types';

// Mock the API
vi.mock('../api/expensesApi');

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useDeleteExpense', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });

  /**
   * Test 1/4: Optimistically remove expense from cache
   * Verifies expense is removed immediately before API completes
   */
  it('should optimistically remove expense from cache', async () => {
    // Arrange: Set up initial expense list in cache
    const initialExpenses: Expense[] = [
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Expense to delete',
        date: '2026-01-22',
        createdAt: '2026-01-22T03:30:00Z',
        updatedAt: '2026-01-22T03:30:00Z',
      },
      {
        id: 'expense-2',
        userId: 'user-1',
        amount: 75000,
        note: 'Expense to keep',
        date: '2026-01-21',
        createdAt: '2026-01-21T04:00:00Z',
        updatedAt: '2026-01-21T04:00:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    // Mock successful API delete
    vi.mocked(expensesApi.deleteExpense).mockResolvedValue(undefined);

    // Act: Delete expense-1
    const { result } = renderHook(() => useDeleteExpense(), { wrapper });

    result.current.mutate('expense-1');

    // Assert: Check optimistic update (expense-1 removed immediately)
    await waitFor(() => {
      const expenses = queryClient.getQueryData<Expense[]>(['expenses']);
      expect(expenses).toBeDefined();
      expect(expenses!.length).toBe(1); // Only one expense remains
      expect(expenses![0].id).toBe('expense-2'); // expense-1 removed
      expect(expenses![0].note).toBe('Expense to keep');
    });
  });

  /**
   * Test 2/4: Rollback on error with expense restored
   * Verifies deleted expense reappears when API call fails
   */
  it('should rollback on error with expense restored', async () => {
    // Arrange: Set up initial expense list
    const initialExpenses: Expense[] = [
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Expense to delete',
        date: '2026-01-22',
        createdAt: '2026-01-22T03:30:00Z',
        updatedAt: '2026-01-22T03:30:00Z',
      },
      {
        id: 'expense-2',
        userId: 'user-1',
        amount: 75000,
        note: 'Other expense',
        date: '2026-01-21',
        createdAt: '2026-01-21T04:00:00Z',
        updatedAt: '2026-01-21T04:00:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    // Mock API error (network failure, 404, or 403)
    vi.mocked(expensesApi.deleteExpense).mockRejectedValue(
      new Error('Network error')
    );

    // Act: Attempt to delete expense-1 (will fail)
    const { result } = renderHook(() => useDeleteExpense(), { wrapper });

    result.current.mutate('expense-1');

    // Assert: Check rollback (expense-1 restored)
    await waitFor(() => {
      const expenses = queryClient.getQueryData<Expense[]>(['expenses']);
      expect(expenses).toEqual(initialExpenses); // Original state restored
      expect(expenses!.length).toBe(2); // Both expenses back
      expect(expenses!.find(e => e.id === 'expense-1')).toBeDefined(); // expense-1 restored
    });

    // Verify error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể xóa chi tiêu. Vui lòng thử lại.',
        expect.objectContaining({
          duration: 5000,
          position: 'bottom-center',
        })
      );
    });
  });

  /**
   * Test 3/4: Invalidate queries on success
   * Verifies queries are invalidated to trigger refetch after successful delete
   */
  it('should invalidate queries on success', async () => {
    // Arrange
    const initialExpenses: Expense[] = [
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Expense to delete',
        date: '2026-01-22',
        createdAt: '2026-01-22T03:30:00Z',
        updatedAt: '2026-01-22T03:30:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    // Mock successful API delete
    vi.mocked(expensesApi.deleteExpense).mockResolvedValue(undefined);

    // Spy on invalidateQueries to verify it's called
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Act: Delete expense
    const { result } = renderHook(() => useDeleteExpense(), { wrapper });

    result.current.mutate('expense-1');

    // Assert: Verify invalidateQueries was called with correct key
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expenses'] });
    });

    // Verify success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Đã xóa chi tiêu',
        expect.objectContaining({
          duration: 2000,
          position: 'bottom-center',
        })
      );
    });
  });

  /**
   * Test 4/4: Handle network errors gracefully
   * Verifies proper error handling for various failure scenarios (404, 403, network)
   */
  it('should handle network errors gracefully', async () => {
    // Arrange
    const initialExpenses: Expense[] = [
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Test expense',
        date: '2026-01-22',
        createdAt: '2026-01-22T03:30:00Z',
        updatedAt: '2026-01-22T03:30:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    // Mock network failure (could be 404 Not Found, 403 Forbidden, or network timeout)
    const networkError = new Error('Failed to fetch');
    vi.mocked(expensesApi.deleteExpense).mockRejectedValue(networkError);

    // Act: Attempt delete
    const { result } = renderHook(() => useDeleteExpense(), { wrapper });

    result.current.mutate('expense-1');

    // Assert: Verify error is logged (onError handler)
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verify cache was rolled back
    const expenses = queryClient.getQueryData<Expense[]>(['expenses']);
    expect(expenses).toEqual(initialExpenses); // Original state preserved

    // Verify user-friendly error message shown
    expect(toast.error).toHaveBeenCalledWith(
      'Không thể xóa chi tiêu. Vui lòng thử lại.',
      expect.anything()
    );
  });

  /**
   * Bonus Test: Verify mutation state transitions
   * Tests isLoading, isError, and isSuccess flags
   */
  it('should properly manage mutation state transitions', async () => {
    // Arrange
    const initialExpenses: Expense[] = [
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Test',
        date: '2026-01-22',
        createdAt: '2026-01-22T03:30:00Z',
        updatedAt: '2026-01-22T03:30:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    vi.mocked(expensesApi.deleteExpense).mockResolvedValue(undefined);

    // Act
    const { result } = renderHook(() => useDeleteExpense(), { wrapper });

    // Initial state: idle
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);

    // Trigger mutation
    result.current.mutate('expense-1');

    // Assert: Success state after completion
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });
});
