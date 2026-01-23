// Custom hook to load recent unique expense notes from IndexedDB
// Story 2.12: Recent Notes Quick Selection
// Implements instant loading from IndexedDB with TanStack Query cache fallback

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getExpenses } from '../../../services/indexeddb';
import { getUserIdFromToken } from '../../../shared/utils/jwtHelper';
import { useAuth } from '../../../contexts/AuthContext';
import type { Expense } from '../types/expense.types';

/**
 * Hook to retrieve recent unique expense notes for quick selection chips
 *
 * Data Flow:
 * 1. Primary Source: IndexedDB (instant access, works offline)
 * 2. Fallback Source: TanStack Query cache (if IndexedDB empty)
 * 3. Deduplicates notes (same note text appears only once)
 * 4. Orders by most recent first (newest expense's note appears first)
 * 5. Limits to top N notes (default 5 per UX requirement)
 * 6. Filters out empty/whitespace notes
 *
 * Performance Goal: <50ms load time from IndexedDB
 *
 * @param limit - Maximum number of recent notes to return (default 5)
 * @returns Hook state with recent notes array, loading state, and refresh function
 */
export function useRecentNotes(limit: number = 5): {
  recentNotes: string[];
  isLoading: boolean;
  refresh: () => void;
} {
  const [recentNotes, setRecentNotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize loadRecentNotes to ensure stable reference and proper dependency tracking
  // Issue #1 Fix: Add useCallback with proper dependencies
  // Issue #2 Fix: Add abort controller for race condition prevention
  const loadRecentNotes = useCallback(async (): Promise<void> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentAbortController = new AbortController();
    abortControllerRef.current = currentAbortController;

    try {
      setIsLoading(true);
      const userId = getUserIdFromToken(accessToken);

      if (!userId) {
        if (!currentAbortController.signal.aborted) {
          setRecentNotes([]);
        }
        return;
      }

      // Try IndexedDB first (primary source)
      let expenses = await getExpenses(userId);

      // Fallback: Use TanStack Query cache if IndexedDB is empty
      // Issue #5 Fix: Add proper type checking for cache data
      if (expenses.length === 0) {
        const cachedExpenses = queryClient.getQueryData(['expenses']);
        if (Array.isArray(cachedExpenses)) {
          expenses = cachedExpenses as Expense[];
        } else {
          expenses = [];
        }
      }

      // Check if request was aborted before processing results
      if (currentAbortController.signal.aborted) {
        return;
      }

      // Extract unique notes, filter empties, sort by date, limit to top N
      const notesMap = new Map<string, string>(); // Map<note, lastUsedAt>

      expenses.forEach((expense) => {
        const note = expense.note?.trim();
        if (!note) return; // Skip empty/whitespace notes

        const existingTimestamp = notesMap.get(note);
        const currentTimestamp = expense.createdAt;

        // Keep only the most recent timestamp for each note
        if (!existingTimestamp || currentTimestamp > existingTimestamp) {
          notesMap.set(note, currentTimestamp);
        }
      });

      // Convert to array, sort by timestamp (newest first), take top N
      // Issue #3 Fix: Use numeric date comparison instead of localeCompare
      const sortedNotes = Array.from(notesMap.entries())
        .sort((a, b) => {
          const dateA = new Date(a[1]).getTime();
          const dateB = new Date(b[1]).getTime();
          return dateB - dateA; // Numeric sort, DESC (newest first)
        })
        .slice(0, limit)
        .map(([note]) => note);

      if (!currentAbortController.signal.aborted) {
        setRecentNotes(sortedNotes);
      }
    } catch (error) {
      if (!currentAbortController.signal.aborted) {
        console.error('[useRecentNotes] Error loading recent notes:', error);
        setRecentNotes([]);
      }
    } finally {
      if (!currentAbortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [queryClient, limit, accessToken]);

  useEffect(() => {
    loadRecentNotes();

    // Cleanup: cancel pending requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadRecentNotes]);

  return {
    recentNotes,
    isLoading,
    refresh: loadRecentNotes,
  };
}
