/**
 * Budget Alert Message Formatter Utility
 *
 * Formats alert messages for budget thresholds (80%, 100%) in Vietnamese and English.
 * Supports:
 * - 80% threshold: Warning about high usage
 * - 100% threshold: Error about exceeding budget
 * - Vietnamese and English languages
 * - Thousand separators for amounts
 * - Million notation for brevity (12M vs 12,000,000)
 *
 * @param spent - Total amount spent (VND)
 * @param budget - Monthly budget amount (VND)
 * @param threshold - Percentage threshold (80 or 100)
 * @param language - Language code ('vi' or 'en'), defaults to 'vi'
 * @returns Object with title and message strings
 *
 * @example
 * // 80% threshold
 * formatBudgetAlertMessage(12_000_000, 15_000_000, 80, 'vi')
 * // → { title: "Cảnh báo ngân sách", message: "Bạn đã dùng 80% ngân sách..." }
 *
 * @example
 * // 100% threshold (over budget)
 * formatBudgetAlertMessage(15_500_000, 15_000_000, 100, 'vi')
 * // → { title: "Vượt quá ngân sách", message: "Bạn đã vượt quá ngân sách hàng tháng 500,000đ" }
 */

export interface AlertMessageResult {
  formatted: string;
}

/**
 * Format number as millions with one decimal (12.5M) or round integer (12M)
 */
function formatMillions(amount: number): string {
  const millions = amount / 1_000_000;

  // If clean integer, show without decimal
  if (millions % 1 === 0) {
    return `${Math.round(millions)}M`;
  }

  // Otherwise show one decimal
  return `${millions.toFixed(1)}M`;
}

/**
 * Format number with thousand separators (1,234,567đ)
 */
function formatWithSeparator(amount: number): string {
  return `${amount.toLocaleString('en-US')}đ`;
}

export function formatBudgetAlertMessage(
  spent: number,
  budget: number,
  threshold: number,
  language: string = 'vi'
): AlertMessageResult {
  // Handle edge case: zero budget
  if (budget <= 0) {
    return {
      formatted: language === 'vi'
        ? 'Cảnh báo: Ngân sách chưa được thiết lập'
        : 'Alert: Budget not set',
    };
  }

  // Calculate percentage using Math.round for display (not for threshold logic)
  // Threshold crossing is determined by shouldTriggerBudgetAlert, not this formatting utility
  // This rounding is only for message display to user, not for comparison logic
  const percentage = Math.round((spent / budget) * 100);

  // 80% threshold warning
  if (threshold === 80) {
    const spentFormatted = formatMillions(spent);
    const budgetFormatted = formatMillions(budget);

    if (language === 'vi') {
      return {
        formatted: `Cảnh báo ngân sách: Bạn đã dùng ${percentage}% ngân sách tháng này (${spentFormatted} / ${budgetFormatted})`,
      };
    }

    return {
      formatted: `Budget Alert: You've used ${percentage}% of your monthly budget (${spentFormatted} / ${budgetFormatted})`,
    };
  }

  // 100% threshold over-budget
  if (threshold === 100) {
    const excess = spent - budget;
    const excessFormatted = formatWithSeparator(excess);

    if (language === 'vi') {
      return {
        formatted: `Vượt quá ngân sách: Bạn đã vượt quá ngân sách hàng tháng ${excessFormatted}`,
      };
    }

    return {
      formatted: `Over Budget: You've exceeded your monthly budget by ${excessFormatted}`,
    };
  }

  // Fallback for unknown thresholds
  return {
    formatted: language === 'vi'
      ? `Cảnh báo ngân sách: Chi tiêu đã đạt ${percentage}%`
      : `Budget Alert: Spending has reached ${percentage}%`,
  };
}
