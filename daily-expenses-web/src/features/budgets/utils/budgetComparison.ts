import { formatCurrency } from '../../../shared/utils/formatters';

/**
 * Budget projection status returned by getBudgetProjectionStatus
 */
export interface BudgetProjectionStatus {
  /**
   * Status message to display to user
   * Empty string when severity is 'none'
   */
  message: string;

  /**
   * Severity level for styling and user feedback
   * - 'success': Projection is under or equal to budget (green)
   * - 'warning': Projection exceeds budget (orange/yellow)
   * - 'none': No budget set, no comparison possible
   */
  severity: 'success' | 'warning' | 'none';
}

/**
 * Compare projected spending to budget and return status with message
 *
 * @param projected - Projected month-end spending (VND)
 * @param budget - Monthly budget amount (VND), or null if no budget set
 * @returns Status object with message and severity level
 *
 * @remarks
 * **Assumptions:**
 * - Budget must be >= 0 (non-negative). Negative budgets are treated as 0.
 * - Backend validation should enforce budget >= 0 constraint.
 * - If negative budget is passed, function treats it as 0 to avoid unexpected behavior.
 *
 * @example
 * // Projection exceeds budget
 * getBudgetProjectionStatus(12_400_000, 10_000_000)
 * // Returns: { message: "Dự kiến vượt ngân sách 2.400.000đ", severity: "warning" }
 *
 * @example
 * // Projection under budget
 * getBudgetProjectionStatus(12_400_000, 15_000_000)
 * // Returns: { message: "Đang đúng hướng! Dự kiến dư 2.600.000đ", severity: "success" }
 *
 * @example
 * // No budget set
 * getBudgetProjectionStatus(12_400_000, null)
 * // Returns: { message: "", severity: "none" }
 */
export function getBudgetProjectionStatus(
  projected: number,
  budget: number | null
): BudgetProjectionStatus {
  // No budget set - no comparison possible
  if (budget === null) {
    return {
      message: '',
      severity: 'none',
    };
  }

  // Defensive: Treat negative budget as 0 (should not happen if backend validates correctly)
  const normalizedBudget = Math.max(0, budget);

  // Projection exceeds budget - WARNING
  if (projected > normalizedBudget) {
    const excess = projected - normalizedBudget;
    return {
      message: `Dự kiến vượt ngân sách ${formatCurrency(excess)}`,
      severity: 'warning',
    };
  }

  // Projection under or equal to budget - SUCCESS
  const remaining = normalizedBudget - projected;
  return {
    message: `Đang đúng hướng! Dự kiến dư ${formatCurrency(remaining)}`,
    severity: 'success',
  };
}
