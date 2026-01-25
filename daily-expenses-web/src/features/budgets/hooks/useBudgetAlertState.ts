import { useCallback } from 'react';
import {
  saveAlertState,
  getAlertState,
} from '../../../shared/utils/alertStorage';

export interface UseBudgetAlertStateResult {
  hasTriggered: (threshold: number) => boolean;
  markAsTriggered: (budgetId: string, threshold: number) => void;
}

/**
 * Hook for managing budget alert state persistence
 *
 * Uses localStorage to track whether alerts have been triggered for specific
 * budgets and thresholds. Supports multiple budgets and multiple thresholds
 * per budget (e.g., 80% and 100% alerts).
 *
 * @param budgetId - Current budget identifier (null if no budget set)
 * @returns Object with hasTriggered check and markAsTriggered setter
 *
 * @example
 * const { hasTriggered, markAsTriggered } = useBudgetAlertState('budget-123');
 *
 * if (!hasTriggered(80)) {
 *   // Show 80% alert
 *   markAsTriggered('budget-123', 80);
 * }
 */
export function useBudgetAlertState(
  budgetId: string | null
): UseBudgetAlertStateResult {
  /**
   * Check if alert has been triggered for a specific threshold
   *
   * @param threshold - Percentage threshold (e.g., 80 for 80%)
   * @returns true if alert has been triggered, false otherwise
   */
  const hasTriggered = useCallback(
    (threshold: number): boolean => {
      if (!budgetId) {
        return false;
      }

      const state = getAlertState(budgetId, threshold);
      return state.triggered;
    },
    [budgetId]
  );

  /**
   * Mark alert as triggered for a specific budget and threshold
   *
   * @param budgetId - Budget identifier
   * @param threshold - Percentage threshold
   */
  const markAsTriggered = useCallback(
    (budgetId: string, threshold: number): void => {
      saveAlertState(budgetId, threshold, true);
    },
    []
  );

  return { hasTriggered, markAsTriggered };
}
