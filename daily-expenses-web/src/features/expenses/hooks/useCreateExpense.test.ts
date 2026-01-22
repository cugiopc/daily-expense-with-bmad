/**
 * Tests for useCreateExpense hook - Optimistic UI pattern
 * 
 * Tests cover:
 * - Optimistic cache updates
 * - Rollback on error
 * - Query invalidation on success
 * - Temporary ID generation
 * - Toast notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateExpense } from './useCreateExpense';
import * as expensesApi from '../api/expensesApi';
import * as tempIdUtils from '../../../shared/utils/tempId';
import * as jwtHelper from '../../../shared/utils/jwtHelper';
import toast from 'react-hot-toast';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock dependencies
vi.mock('../api/expensesApi');
vi.mock('../../../shared/utils/tempId');
vi.mock('../../../shared/utils/jwtHelper');
vi.mock('react-hot-toast');

// Import React for JSX
import React from 'react';

describe('useCreateExpense', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();

    // Mock utilities
    vi.mocked(tempIdUtils.generateTempId).mockReturnValue('temp-123-abc');
    vi.mocked(jwtHelper.getUserIdFromToken).mockReturnValue('user-456');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      AuthProvider,
      null,
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );
  };

  it('should optimistically add expense to cache', async () => {
    // Mock successful API call
    vi.mocked(expensesApi.createExpense).mockResolvedValue({
      id: 'real-id-789',
      userId: 'user-456',
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    });

    // Set initial cache data
    queryClient.setQueryData(['expenses'], [
      {
        id: 'existing-1',
        userId: 'user-456',
        amount: 30000,
        note: 'lunch',
        date: '2026-01-18',
        createdAt: '2026-01-18T12:00:00Z',
        updatedAt: '2026-01-18T12:00:00Z',
      },
    ]);

    const { result } = renderHook(() => useCreateExpense(), { wrapper });

    // Trigger mutation
    result.current.mutate({
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
    });

    // Wait for onMutate to execute
    await waitFor(() => {
      const cacheData = queryClient.getQueryData(['expenses']);
      expect(cacheData).toHaveLength(2);
    });

    // Verify optimistic expense was added with temp ID
    const cacheData: any = queryClient.getQueryData(['expenses']);
    expect(cacheData[0]).toMatchObject({
      id: 'temp-123-abc',
      userId: 'user-456',
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
    });
  });

  it('should rollback on API error', async () => {
    // Mock API failure
    vi.mocked(expensesApi.createExpense).mockRejectedValue(
      new Error('Network error')
    );

    // Set initial cache data
    const initialData = [
      {
        id: 'existing-1',
        userId: 'user-456',
        amount: 30000,
        note: 'lunch',
        date: '2026-01-18',
        createdAt: '2026-01-18T12:00:00Z',
        updatedAt: '2026-01-18T12:00:00Z',
      },
    ];
    queryClient.setQueryData(['expenses'], initialData);

    const { result } = renderHook(() => useCreateExpense(), { wrapper });

    // Trigger mutation
    result.current.mutate({
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
    });

    // Wait for onError to execute
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verify cache was rolled back to initial state
    const cacheData = queryClient.getQueryData(['expenses']);
    expect(cacheData).toEqual(initialData);

    // Verify error toast was shown
    expect(toast.error).toHaveBeenCalledWith(
      'Không thể thêm chi tiêu. Vui lòng thử lại.',
      expect.objectContaining({
        duration: 5000,
        position: 'bottom-center',
      })
    );
  });

  it('should invalidate queries on success', async () => {
    // Mock successful API call
    vi.mocked(expensesApi.createExpense).mockResolvedValue({
      id: 'real-id-789',
      userId: 'user-456',
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    });

    const { result } = renderHook(() => useCreateExpense(), { wrapper });

    // Spy on query invalidation
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Trigger mutation
    result.current.mutate({
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
    });

    // Wait for success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify all related queries were invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expenses'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expenses', 'stats'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets', 'current'] });

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith(
      'Chi tiêu đã được thêm!',
      expect.objectContaining({
        duration: 3000,
        position: 'bottom-center',
        icon: '✅',
      })
    );
  });

  it('should use real userId from JWT token', async () => {
    vi.mocked(expensesApi.createExpense).mockResolvedValue({
      id: 'real-id-789',
      userId: 'user-456',
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    });

    queryClient.setQueryData(['expenses'], []);

    const { result } = renderHook(() => useCreateExpense(), { wrapper });

    result.current.mutate({
      amount: 50000,
      note: 'cafe',
      date: '2026-01-19',
    });

    await waitFor(() => {
      const cacheData: any = queryClient.getQueryData(['expenses']);
      expect(cacheData).toHaveLength(1);
    });

    // Verify getUserIdFromToken was called (with any token from AuthContext)
    expect(jwtHelper.getUserIdFromToken).toHaveBeenCalled();

    // Verify optimistic expense has correct userId
    const cacheData: any = queryClient.getQueryData(['expenses']);
    expect(cacheData[0].userId).toBe('user-456');
  });
});
