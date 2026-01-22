// TanStack Query hook for updating expenses
// Implements optimistic UI pattern from Architecture Doc (Decision 9)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateExpense } from '../api/expensesApi';
import type { UpdateExpenseDto, Expense } from '../types/expense.types';

/**
 * Hook for updating an existing expense with optimistic UI updates
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
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) => 
      updateExpense(id, data),

    // OPTIMISTIC UPDATE (executed immediately before API call)
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      // Snapshot the previous value for rollback
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses']);

      // Optimistically update the cache
      queryClient.setQueryData<Expense[]>(['expenses'], (old = []) => {
        return old.map(expense => 
          expense.id === id
            ? { 
                ...expense, 
                amount: data.amount,
                note: data.note || null,
                date: data.date,
                updatedAt: new Date().toISOString() 
              }
            : expense
        );
      });

      // Return context object with snapshot for rollback
      return { previousExpenses };
    },

    // ROLLBACK on error (restore previous state)
    onError: (err, variables, context) => {
      console.error('Failed to update expense:', err);

      // Restore previous state
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses'], context.previousExpenses);
      }

      // Show user-friendly error message (Vietnamese per config)
      toast.error('Không thể cập nhật chi tiêu. Vui lòng thử lại.', {
        duration: 5000,
        position: 'bottom-center',
      });
    },

    // REFETCH on success (get server data with real timestamps)
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      // This will update totals and ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['expenses'] });

      // Show success toast (Vietnamese per config)
      toast.success('Đã cập nhật chi tiêu', {
        duration: 2000,
        position: 'bottom-center',
      });
    },
  });
}
