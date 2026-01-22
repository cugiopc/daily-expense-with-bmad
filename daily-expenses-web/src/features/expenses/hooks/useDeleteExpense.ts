// TanStack Query hook for deleting expenses
// Implements optimistic UI pattern from Architecture Doc (Decision 9)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteExpense } from '../api/expensesApi';
import type { Expense } from '../types/expense.types';

/**
 * Hook for deleting an expense with optimistic UI updates
 *
 * Optimistic UI Flow (from Architecture Doc):
 * 1. onMutate: Cancel outgoing queries, snapshot previous state, optimistically remove from cache
 * 2. Request sent to backend (user doesn't wait)
 * 3. onSuccess: Invalidate queries to refetch latest data, show success toast
 * 4. onError: Rollback to previous state (restore deleted expense), show error toast
 *
 * Performance Goal: <500ms perceived time (optimistic update = instant visual feedback)
 *
 * @returns TanStack Query mutation object
 */
export function useDeleteExpense(): ReturnType<typeof useMutation<void, Error, string, { previousExpenses: Expense[] | undefined }>> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),

    // OPTIMISTIC UPDATE (executed immediately before API call)
    onMutate: async (id) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      // Snapshot the previous value for rollback
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses']);

      // Optimistically remove the expense from cache
      queryClient.setQueryData<Expense[]>(['expenses'], (old = []) => {
        return old.filter(expense => expense.id !== id);
      });

      // Return context object with snapshot for rollback
      return { previousExpenses };
    },

    // ROLLBACK on error (restore deleted expense)
    onError: (err, _id, context) => {
      console.error('Failed to delete expense:', err);

      // Restore previous state
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses'], context.previousExpenses);
      }

      // Show user-friendly error message (Vietnamese per config)
      toast.error('Không thể xóa chi tiêu. Vui lòng thử lại.', {
        duration: 5000,
        position: 'bottom-center',
      });
    },

    // REFETCH on success (ensure data consistency)
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      // This will update totals and ensure no orphaned data
      queryClient.invalidateQueries({ queryKey: ['expenses'] });

      // Show success toast (Vietnamese per config)
      toast.success('Đã xóa chi tiêu', {
        duration: 2000,
        position: 'bottom-center',
      });
    },
  });
}
