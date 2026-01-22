// Tests for useUpdateExpense hook
// Story 2.8: Edit Expense Functionality

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateExpense } from './useUpdateExpense';
import * as expensesApi from '../api/expensesApi';
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

describe('useUpdateExpense', () => {
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

  it('should optimistically update expense in cache', async () => {
    // Arrange: Set up initial expense list in cache
    const initialExpenses: Expense[] = [
      {
        id: '1',
        userId: 'user-1',
        amount: 50000,
        note: 'original note',
        date: '2026-01-15',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    vi.mocked(expensesApi.updateExpense).mockResolvedValue({
      id: '1',
      userId: 'user-1',
      amount: 75000,
      note: 'updated note',
      date: '2026-01-16',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T11:00:00Z',
    });

    // Act
    const { result } = renderHook(() => useUpdateExpense(), { wrapper });
    
    result.current.mutate({
      id: '1',
      data: {
        amount: 75000,
        note: 'updated note',
        date: '2026-01-16',
      },
    });

    // Assert: Check optimistic update
    await waitFor(() => {
      const expenses = queryClient.getQueryData<Expense[]>(['expenses']);
      expect(expenses).toBeDefined();
      expect(expenses![0].amount).toBe(75000);
      expect(expenses![0].note).toBe('updated note');
      expect(expenses![0].date).toBe('2026-01-16');
    });
  });

  it('should rollback on error', async () => {
    // Arrange
    const initialExpenses: Expense[] = [
      {
        id: '1',
        userId: 'user-1',
        amount: 50000,
        note: 'original note',
        date: '2026-01-15',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    vi.mocked(expensesApi.updateExpense).mockRejectedValue(
      new Error('Network error')
    );

    // Act
    const { result } = renderHook(() => useUpdateExpense(), { wrapper });
    
    result.current.mutate({
      id: '1',
      data: {
        amount: 75000,
        note: 'updated note',
        date: '2026-01-16',
      },
    });

    // Assert: Check rollback
    await waitFor(() => {
      const expenses = queryClient.getQueryData<Expense[]>(['expenses']);
      expect(expenses).toEqual(initialExpenses); // Should restore original
    });
  });

  it('should invalidate queries on success', async () => {
    // Arrange
    const initialExpenses: Expense[] = [
      {
        id: '1',
        userId: 'user-1',
        amount: 50000,
        note: 'original note',
        date: '2026-01-15',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialExpenses);

    vi.mocked(expensesApi.updateExpense).mockResolvedValue({
      id: '1',
      userId: 'user-1',
      amount: 75000,
      note: 'updated note',
      date: '2026-01-16',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T11:00:00Z',
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Act
    const { result } = renderHook(() => useUpdateExpense(), { wrapper });
    
    result.current.mutate({
      id: '1',
      data: {
        amount: 75000,
        note: 'updated note',
        date: '2026-01-16',
      },
    });

    // Assert
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expenses'] });
    });
  });
});
