import { useState, useRef, useEffect } from 'react';
import type { Budget } from '../types';
import { useBudgetAlertState } from './useBudgetAlertState';
import { shouldTriggerBudgetAlert } from '../utils/shouldTriggerBudgetAlert';
import { formatBudgetAlertMessage } from '../utils/formatBudgetAlertMessage';
import { clearAlertState } from '../../../shared/utils/alertStorage';
import { getCurrentMonth } from '../../../shared/utils/dateHelpers';

export interface UseBudgetAlertResult {
  alertOpen: boolean;
  alertMessage: string;
  alertSeverity: 'warning' | 'error';
  alertThreshold: number; // 80 or 100
  closeAlert: () => void;
}

/**
 * Main budget alert orchestration hook
 *
 * Monitors monthly spending and triggers alerts when crossing thresholds:
 * - 80% threshold: Warning alert (yellow/orange)
 * - 100% threshold: Error alert (red) - over-budget
 *
 * Features:
 * - Detects threshold crossing using previousTotal vs newTotal
 * - Persists alert state to prevent re-triggering
 * - Generates Vietnamese alert messages using formatBudgetAlertMessage
 * - Provides closeAlert function for manual dismissal
 * - Supports multiple thresholds independently
 *
 * @param budget - Current month's budget (null if not set)
 * @param monthlyTotal - Current monthly spending total
 * @returns Alert state and controls
 *
 * @example
 * const { alertOpen, alertMessage, closeAlert, alertSeverity, alertThreshold } =
 *   useBudgetAlert(budget, monthlyTotal);
 *
 * <BudgetAlertSnackbar
 *   open={alertOpen}
 *   onClose={closeAlert}
 *   message={alertMessage}
 *   severity={alertSeverity}
 *   threshold={alertThreshold}
 * />
 */
export function useBudgetAlert(
  budget: Budget | null,
  monthlyTotal: number
): UseBudgetAlertResult {
  const [alertOpen, setAlertOpen] = useState(false);
  const [activeThreshold, setActiveThreshold] = useState<number>(80);
  const previousTotalRef = useRef(monthlyTotal);
  const previousMonthRef = useRef(getCurrentMonth());
  const previousBudgetIdRef = useRef(budget?.id || null);

  const { hasTriggered, markAsTriggered } = useBudgetAlertState(
    budget?.id || null
  );

  useEffect(() => {
    if (!budget) {
      return;
    }

    const previousTotal = previousTotalRef.current;
    const newTotal = monthlyTotal;

    // Check 80% threshold first
    const shouldTrigger80 = shouldTriggerBudgetAlert(
      previousTotal,
      newTotal,
      budget.amount,
      80,
      hasTriggered(80)
    );

    if (shouldTrigger80) {
      setActiveThreshold(80);
      setAlertOpen(true);
      markAsTriggered(budget.id, 80);
    }

    // Then check 100% threshold (over-budget)
    const shouldTrigger100 = shouldTriggerBudgetAlert(
      previousTotal,
      newTotal,
      budget.amount,
      100,
      hasTriggered(100)
    );

    if (shouldTrigger100) {
      setActiveThreshold(100);
      setAlertOpen(true);
      markAsTriggered(budget.id, 100);
    }

    // Update previous total
    previousTotalRef.current = newTotal;
  }, [monthlyTotal, budget, hasTriggered, markAsTriggered]);

  // AC 7: Detect month change and reset alerts
  useEffect(() => {
    const currentMonth = getCurrentMonth();
    const previousMonth = previousMonthRef.current;

    if (currentMonth !== previousMonth && budget?.id) {
      // New month started - clear all alert states for this budget
      clearAlertState(budget.id);
      previousMonthRef.current = currentMonth;
    }
  }, [budget?.id]);

  // AC 7: Detect budget change
  useEffect(() => {
    const currentBudgetId = budget?.id || null;
    const previousBudgetId = previousBudgetIdRef.current;

    if (currentBudgetId !== previousBudgetId) {
      // Budget changed - update ref for future comparisons
      previousBudgetIdRef.current = currentBudgetId;
    }
  }, [budget?.id]);

  // Generate alert message using formatBudgetAlertMessage utility
  const { formatted } = formatBudgetAlertMessage(
    monthlyTotal,
    budget?.amount || 0,
    activeThreshold,
    'vi'
  );

  const alertMessage = formatted;

  // Determine severity based on threshold
  const alertSeverity = activeThreshold === 100 ? 'error' : 'warning';

  /**
   * Close alert manually
   */
  const closeAlert = (): void => {
    setAlertOpen(false);
  };

  return {
    alertOpen,
    alertMessage,
    alertSeverity,
    alertThreshold: activeThreshold,
    closeAlert,
  };
}
