/**
 * Calculates the daily spending average for the current month.
 * Formula: monthlyTotal / daysElapsed
 * Days elapsed = current day of month (1-31)
 *
 * @param monthlyTotal - Total spending for the current month in VND (non-negative expected)
 * @param currentDate - Current date to calculate days elapsed from
 * @returns Daily average spending in VND (rounded to whole number, minimum 0)
 */
export function calculateDailyAverage(monthlyTotal: number, currentDate: Date): number {
  // Safeguard: Negative amounts don't make sense for "daily spending average"
  // Treat as 0 to protect against bad data (e.g., buggy aggregation)
  const safeMonthlyTotal = monthlyTotal < 0 ? 0 : monthlyTotal;

  // Get day of month (1-31)
  const daysElapsed = currentDate.getDate();

  // Safeguard: Should never be 0, but default to 1 to avoid division by zero
  const safeDaysElapsed = daysElapsed > 0 ? daysElapsed : 1;

  // Calculate daily average
  const dailyAverage = safeMonthlyTotal / safeDaysElapsed;

  // Round to whole VND (no decimals needed)
  return Math.round(dailyAverage);
}
