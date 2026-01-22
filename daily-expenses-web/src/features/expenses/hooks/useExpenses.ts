/**
 * Custom hook for fetching expenses with offline support
 * 
 * Strategy:
 * - When online: Use API via TanStack Query
 * - When offline: Fall back to IndexedDB
 * - Merge pending offline expenses with synced data
 */

import { useQuery } from '@tanstack/react-query';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { getExpenses as getExpensesFromAPI } from '../api/expensesApi';
import { getExpenses as getExpensesFromIndexedDB } from '../../../services/indexeddb/index';
import { getUserIdFromToken } from '../../../shared/utils/jwtHelper';
import { useAuth } from '../../../contexts/AuthContext';
import type { Expense } from '../types/expense.types';

/**
 * Fetches expenses with offline fallback
 * - Online: Uses API
 * - Offline: Uses IndexedDB
 */
export function useExpenses() {
  const isOnline = useOnlineStatus();
  const { accessToken } = useAuth();
  const userId = getUserIdFromToken(accessToken);

  return useQuery({
    queryKey: ['expenses', { isOnline }], // Include isOnline to refetch when connection status changes
    queryFn: async (): Promise<Expense[]> => {
      if (isOnline) {
        // Online: Fetch from API
        return getExpensesFromAPI();
      } else {
        // Offline: Fetch from IndexedDB
        if (!userId) {
          console.warn('[useExpenses] No userId available for IndexedDB query');
          return [];
        }

        const offlineExpenses = await getExpensesFromIndexedDB(userId);

        // Convert OfflineExpense to Expense format with safe defaults
        return offlineExpenses.map((exp) => ({
          id: exp.id,
          userId: exp.userId,
          amount: exp.amount,
          note: exp.note || null,
          date: exp.date,
          createdAt: exp.createdAt,
          updatedAt: exp.updatedAt || exp.createdAt,
          pending_sync: exp.pending_sync ?? false,
          syncStatus: exp.syncStatus || 'pending',
          localOnly: exp.localOnly ?? false,
        }));
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId, // Only run query if user is authenticated
    refetchOnWindowFocus: true,
    refetchOnReconnect: true, // Refetch when connection restored
  });
}
