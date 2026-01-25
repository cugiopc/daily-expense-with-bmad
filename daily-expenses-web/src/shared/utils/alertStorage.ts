/**
 * Alert State Storage Utility
 *
 * Manages budget alert state persistence using localStorage.
 * Supports multiple budgets and thresholds (80%, 100%).
 *
 * Key format: budgetAlert:{budgetId}:{threshold}
 * Value format: { triggered: boolean, timestamp: string, threshold: number }
 */

/**
 * Error tracking helper for production monitoring
 * Integrates with error tracking service if available (Sentry, etc.)
 */
function trackStorageError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (import.meta.env.PROD) {
    // TODO: Integrate with error tracking service when available
    // Example: window.Sentry?.captureException(error, { tags: { operation }, extra: context })
    // For now, we silently fail to prevent user disruption
  } else {
    // Development: log for debugging
    console.warn(`[AlertStorage] ${operation} failed:`, error, context);
  }
}

export interface AlertState {
  triggered: boolean;
  timestamp: string | null;
}

interface StoredAlertState {
  triggered: boolean;
  timestamp: string;
  threshold: number;
}

/**
 * Save alert state to localStorage
 *
 * @param budgetId - Budget identifier
 * @param threshold - Alert threshold percentage (e.g., 80 for 80%)
 * @param triggered - Whether alert has been triggered
 */
export function saveAlertState(
  budgetId: string,
  threshold: number,
  triggered: boolean
): void {
  try {
    const key = `budgetAlert:${budgetId}:${threshold}`;
    const value: StoredAlertState = {
      triggered,
      timestamp: new Date().toISOString(),
      threshold,
    };

    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Handle quota exceeded error gracefully - track but don't disrupt user
    trackStorageError('saveAlertState', error, { budgetId, threshold, triggered });
  }
}

/**
 * Get alert state from localStorage
 *
 * @param budgetId - Budget identifier
 * @param threshold - Alert threshold percentage
 * @returns Alert state with triggered flag and timestamp
 */
export function getAlertState(
  budgetId: string,
  threshold: number
): AlertState {
  try {
    const key = `budgetAlert:${budgetId}:${threshold}`;
    const stored = localStorage.getItem(key);

    if (!stored) {
      return { triggered: false, timestamp: null };
    }

    const parsed = JSON.parse(stored) as Partial<StoredAlertState>;

    // Handle missing or invalid data
    return {
      triggered: parsed.triggered ?? false,
      timestamp: parsed.timestamp ?? null,
    };
  } catch (error) {
    // Handle corrupted data gracefully - track error and return safe defaults
    trackStorageError('getAlertState', error, { budgetId, threshold });
    return { triggered: false, timestamp: null };
  }
}

/**
 * Clear all alert states for a specific budget
 * Useful when budget changes or new month starts
 *
 * @param budgetId - Budget identifier to clear
 */
export function clearAlertState(budgetId: string): void {
  try {
    // Find all keys for this budget (supports multiple thresholds)
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`budgetAlert:${budgetId}:`)) {
        keysToRemove.push(key);
      }
    }

    // Remove all matching keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    // Handle error gracefully - track but don't disrupt user flow
    trackStorageError('clearAlertState', error, { budgetId });
  }
}
