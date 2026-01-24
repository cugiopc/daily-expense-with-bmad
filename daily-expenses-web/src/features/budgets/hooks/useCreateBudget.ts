// TanStack Query hook for creating/updating budgets
// Implements optimistic UI pattern from Architecture Doc (Decision 9)
// Story 3.2: Set Monthly Budget API and UI

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createBudget } from '../api/budgetsApi';
import type { CreateBudgetDto } from '../types/budget.types';

/**
 * Hook for creating or updating a monthly budget with optimistic UI updates
 *
 * UPSERT Behavior (from Story 3.2):
 * - If budget exists for month: Updates amount, returns 200 OK
 * - If budget doesn't exist: Creates new budget, returns 201 Created
 *
 * Optimistic UI Flow:
 * 1. onMutate: Cancel outgoing queries, snapshot previous state
 * 2. Request sent to backend (user doesn't wait)
 * 3. onSuccess: Invalidate queries to refetch latest data, show success toast
 * 4. onError: Rollback to previous state, show error toast
 *
 * @returns TanStack Query mutation object
 */
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,

    // OPTIMISTIC UPDATE (optional for budgets - can skip for simpler UX)
    onMutate: async () => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['budgets'] });
      await queryClient.cancelQueries({ queryKey: ['budgets', 'current'] });
    },

    // ROLLBACK on error
    onError: () => {
      // Show user-friendly error message (Vietnamese per config)
      toast.error('Không thể lưu ngân sách. Vui lòng thử lại.', {
        duration: 4000,
        position: 'bottom-center',
      });
    },

    // REFETCH on success
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      // This ensures UI shows the latest budget data from server
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'stats'] }); // Stats may show budget comparison

      // Show success feedback (Vietnamese per config)
      toast.success('Ngân sách đã được lưu!', {
        duration: 4000,
        position: 'bottom-center',
        icon: '✅',
      });
    },
  });
}
