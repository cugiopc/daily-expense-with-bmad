// TanStack Query hook for creating expenses
// Implements optimistic UI pattern from Architecture Doc (Decision 9)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createExpense } from '../api/expensesApi';
import type { CreateExpenseDto, Expense } from '../types/expense.types';
import { generateTempId } from '../../../shared/utils/tempId';
import { getUserIdFromToken } from '../../../shared/utils/jwtHelper';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Hook for creating a new expense with optimistic UI updates
 * 
 * Optimistic UI Flow (from Architecture Doc):
 * 1. onMutate: Cancel outgoing queries, snapshot previous state, optimistically update cache
 * 2. Request sent to backend (user doesn't wait)
 * 3. onSuccess: Invalidate queries to refetch latest data, show success toast
 * 4. onError: Rollback to previous state, show error toast
 * 
 * Performance Goal: <500ms perceived time (optimistic update = instant visual feedback)
 * 
 * @returns TanStack Query mutation object
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: CreateExpenseDto) => createExpense(data),

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

      // Show success feedback (Vietnamese per config)
      toast.success('Chi tiêu đã được thêm!', {
        duration: 3000,
        position: 'bottom-center',
        icon: '✅',
      });
    },
  });
}
