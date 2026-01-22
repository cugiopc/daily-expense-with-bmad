// TanStack Query hook for creating expenses
// Implements optimistic UI pattern from Architecture Doc (Decision 9)
// Enhanced with offline-first support (Story 2.10)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createExpense } from '../api/expensesApi';
import type { CreateExpenseDto, Expense } from '../types/expense.types';
import { generateTempId } from '../../../shared/utils/tempId';
import { getUserIdFromToken } from '../../../shared/utils/jwtHelper';
import { useAuth } from '../../../contexts/AuthContext';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { createExpense as createOfflineExpense } from '../../../services/indexeddb/index';

/**
 * Hook for creating a new expense with optimistic UI updates and offline support
 *
 * Optimistic UI Flow (from Architecture Doc):
 * 1. onMutate: Cancel outgoing queries, snapshot previous state, optimistically update cache
 * 2. Request sent to backend (user doesn't wait)
 * 3. onSuccess: Invalidate queries to refetch latest data, show success toast
 * 4. onError: Rollback to previous state, show error toast
 *
 * Offline-First Flow (Story 2.10):
 * - If online: POST to API as normal
 * - If offline: Save to IndexedDB with pending_sync flag
 * - Auto-sync when connection restores (handled by useAutoSync hook)
 *
 * Performance Goal: <500ms perceived time (optimistic update = instant visual feedback)
 *
 * @returns TanStack Query mutation object
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (data: CreateExpenseDto) => {
      const userId = getUserIdFromToken(accessToken);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Check if online
      if (isOnline) {
        // Online: Use API
        return createExpense(data);
      } else {
        // Offline: Save to IndexedDB
        console.log('[useCreateExpense] Offline mode - saving to IndexedDB');

        const offlineExpense = await createOfflineExpense({
          userId,
          amount: data.amount,
          note: data.note || '',
          date: data.date,
          pending_sync: true,
          syncStatus: 'pending',
          localOnly: true,
        });

        // Convert OfflineExpense to Expense format for cache
        return {
          id: offlineExpense.id,
          userId: offlineExpense.userId,
          amount: offlineExpense.amount,
          note: offlineExpense.note || null,
          date: offlineExpense.date,
          createdAt: offlineExpense.createdAt,
          updatedAt: offlineExpense.updatedAt || offlineExpense.createdAt,
        } as Expense;
      }
    },

    // OPTIMISTIC UPDATE (executed immediately before API call)
    onMutate: async (newExpense) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      // Snapshot the previous value for rollback
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses']);

      // Get userId from JWT token
      const userId = getUserIdFromToken(accessToken);

      // Optimistically update the cache with temporary expense
      queryClient.setQueryData<Expense[]>(['expenses'], (old = []) => {
        const optimisticExpense: Expense = {
          ...newExpense,
          id: generateTempId(), // Use utility function for temp ID
          userId: userId || 'unknown', // Real userId from token
          note: newExpense.note || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to beginning of list (newest first)
        return [optimisticExpense, ...old];
      });

      // Return context object with snapshot for rollback
      return { previousExpenses };
    },

    // ROLLBACK on error (restore previous state)
    onError: (err, newExpense, context) => {
      console.error('Failed to create expense:', err);

      // Restore previous state
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses'], context.previousExpenses);
      }

      // Show user-friendly error message (Vietnamese per config)
      toast.error('Không thể thêm chi tiêu. Vui lòng thử lại.', {
        duration: 5000,
        position: 'bottom-center',
      });
    },

    // REFETCH on success (get server data with real IDs and timestamps)
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'current'] });

      // Show success feedback with different message for online vs offline
      if (isOnline) {
        toast.success('Chi tiêu đã được thêm!', {
          duration: 3000,
          position: 'bottom-center',
          icon: '✅',
        });
      } else {
        toast.success('Đã lưu offline. Sẽ đồng bộ khi có kết nối.', {
          duration: 4000,
          position: 'bottom-center',
          icon: '📱',
        });
      }
    },
  });
}
