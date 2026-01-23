// Custom hook to load recent unique expense notes from IndexedDB
// Story 2.12: Recent Notes Quick Selection
// Implements instant loading from IndexedDB with TanStack Query cache fallback

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getExpenses } from '../../../services/indexeddb';
import { getUserIdFromToken } from '../../../shared/utils/jwtHelper';
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

  const loadRecentNotes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const userId = getUserIdFromToken();

      if (!userId) {
        setRecentNotes([]);
        return;
      }

      // Try IndexedDB first (primary source)
      let expenses = await getExpenses(userId);

      // Fallback: Use TanStack Query cache if IndexedDB is empty
      if (expenses.length === 0) {
        const cachedExpenses = queryClient.getQueryData(['expenses']) as Expense[] | undefined;
        expenses = cachedExpenses || [];
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
      const sortedNotes = Array.from(notesMap.entries())
        .sort((a, b) => b[1].localeCompare(a[1])) // Sort by timestamp DESC
        .slice(0, limit)
        .map(([note]) => note);

      setRecentNotes(sortedNotes);
    } catch (error) {
      console.error('[useRecentNotes] Error loading recent notes:', error);
      setRecentNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentNotes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    recentNotes,
    isLoading,
    refresh: loadRecentNotes,
  };
}
