/**
 * Custom hook for fetching current month's budget
 * Story 3.2: Set Monthly Budget API and UI
 */

import { useQuery } from '@tanstack/react-query';
import { getCurrentBudget } from '../api/budgetsApi';

/**
 * Fetches budget for current month
 *
 * Requirements from Story 3.2:
 * - Returns budget for first day of current month
 * - Returns null if no budget set (expected case)
 * - Requires JWT authentication (handled by axios interceptor)
 *
 * Use Cases:
 * - Pre-fill BudgetForm with current budget amount
 * - Display current budget in settings/dashboard
 * - Calculate remaining budget in expense tracking
 *
 * @returns TanStack Query result with current budget or null
 */
export function useCurrentBudget() {
  return useQuery({
    queryKey: ['budgets', 'current'],
    queryFn: getCurrentBudget,
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent for current data
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 1, // Only retry once on failure
    // Handle null return gracefully (no budget set is expected)
    // TanStack Query will not treat null as an error
  });
}
