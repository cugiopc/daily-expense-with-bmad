import { useEffect, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncWithRetry } from '../services/indexeddb/sync';
import {
  canRetry,
  getTimeUntilNextRetry,
  getRetryState,
} from '../services/indexeddb/retryManager';

/**
 * Custom hook to automatically sync offline expenses when connection is restored
 * with exponential backoff retry logic
 * @param userId Current user ID
 */
export function useAutoSync(userId: string | undefined): void {
  const isOnline = useOnlineStatus();
  const retryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing retry timer
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    if (!isOnline || !userId) {
      return;
    }

    // Schedule retry with exponential backoff
    const scheduleRetry = () => {
      // Check if retry is allowed
      if (!canRetry(userId)) {
        const retryState = getRetryState(userId);
        console.log('[useAutoSync] Max retries reached:', retryState);
        return;
      }

      // Get time until next retry
      const delayMs = getTimeUntilNextRetry(userId);

      if (delayMs === null) {
        // First attempt - sync immediately
        console.log('[useAutoSync] Connection restored, triggering immediate sync...');
        attemptSync();
      } else if (delayMs > 0) {
        // Schedule retry after delay
        console.log(
          `[useAutoSync] Scheduling retry in ${Math.round(delayMs / 1000)}s...`
        );

        retryTimerRef.current = window.setTimeout(() => {
          attemptSync();
        }, delayMs);
      } else {
        // Delay has passed, sync immediately
        console.log('[useAutoSync] Retry delay passed, syncing now...');
        attemptSync();
      }
    };

    // Attempt sync and schedule retry on failure
    const attemptSync = async () => {
      try {
        const result = await syncWithRetry(userId);

        if (result.success) {
          console.log(
            `[useAutoSync] Successfully synced ${result.syncedCount} expenses`
          );
        } else {
          console.log('[useAutoSync] Sync failed, retry scheduled');

          // Schedule next retry if not max retries
          const retryState = getRetryState(userId);
          if (retryState.attemptCount < 3) {
            scheduleRetry();
          }
        }
      } catch (error) {
        console.error('[useAutoSync] Unexpected error during sync:', error);
      }
    };

    // Start sync process
    scheduleRetry();

    // Cleanup timer on unmount or dependency change
    return () => {
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [isOnline, userId]);
}
