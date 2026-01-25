import { useState, useRef, useEffect } from 'react';
import type { Budget } from '../types';
import { useBudgetAlertState } from './useBudgetAlertState';
import { shouldTriggerBudgetAlert } from '../utils/shouldTriggerBudgetAlert';
import { clearAlertState } from '../../../shared/utils/alertStorage';
import { getCurrentMonth } from '../../../shared/utils/dateHelpers';

export interface UseBudgetAlertResult {
  alertOpen: boolean;
  alertMessage: string;
  alertSeverity: 'warning' | 'error';
  closeAlert: () => void;
}

/**
 * Main budget alert orchestration hook
 *
 * Monitors monthly spending and triggers alerts when crossing thresholds:
 * - 80% threshold: Warning alert (yellow/orange)
 * - 100% threshold: Error alert (red) - for future Story 3.8
 *
 * Features:
 * - Detects threshold crossing using previousTotal vs newTotal
 * - Persists alert state to prevent re-triggering
 * - Generates Vietnamese alert messages
 * - Provides closeAlert function for manual dismissal
 *
 * @param budget - Current month's budget (null if not set)
 * @param monthlyTotal - Current monthly spending total
 * @returns Alert state and controls
 *
 * @example
 * const { alertOpen, alertMessage, closeAlert, alertSeverity } =
 *   useBudgetAlert(budget, monthlyTotal);
 *
 * <BudgetAlertSnackbar
 *   open={alertOpen}
 *   onClose={closeAlert}
 *   message={alertMessage}
 *   severity={alertSeverity}
 * />
 */
export function useBudgetAlert(
  budget: Budget | null,
  monthlyTotal: number
): UseBudgetAlertResult {
  const [alertOpen, setAlertOpen] = useState(false);
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

    // Check if alert should trigger
    const shouldTrigger = shouldTriggerBudgetAlert(
      previousTotal,
      newTotal,
      budget.amount,
      80, // 80% threshold
      hasTriggered(80)
    );

    if (shouldTrigger) {
      setAlertOpen(true);
      markAsTriggered(budget.id, 80);
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

  // Format amounts in millions for brevity (AC 2: integer format for readability)
  const spentMillions = Math.round(monthlyTotal / 1_000_000);
  const budgetMillions = budget ? Math.round(budget.amount / 1_000_000) : 0;

  // Calculate actual percentage for dynamic message (fixes MEDIUM-1: hardcoded 80%)
  const percentage = budget && budget.amount > 0
    ? Math.round((monthlyTotal / budget.amount) * 100)
    : 0;

  // Vietnamese alert message (AC 2) - now dynamic for reuse in Story 3.8
  const alertMessage = `Cảnh báo ngân sách: Bạn đã dùng ${percentage}% ngân sách tháng này (${spentMillions}M / ${budgetMillions}M)`;

  /**
   * Close alert manually
   */
  const closeAlert = (): void => {
    setAlertOpen(false);
  };

  return {
    alertOpen,
    alertMessage,
    alertSeverity: 'warning', // 80% threshold uses warning severity
    closeAlert,
  };
}
