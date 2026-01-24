/**
 * Custom hook for fetching all budgets for authenticated user
 * Story 3.2: Set Monthly Budget API and UI
 */

import { useQuery } from '@tanstack/react-query';
import { getBudgets } from '../api/budgetsApi';

/**
 * Fetches all budgets for authenticated user, ordered by month descending
 *
 * Requirements from Story 3.2:
 * - Returns budgets ordered by month DESC (newest first)
 * - Only returns budgets owned by authenticated user (security)
 * - Requires JWT authentication (handled by axios interceptor)
 *
 * @returns TanStack Query result with budgets array
 */
export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgets,
    staleTime: 5 * 60 * 1000, // 5 minutes - budgets don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time (formerly cacheTime)
    retry: 1, // Only retry once on failure
  });
}
