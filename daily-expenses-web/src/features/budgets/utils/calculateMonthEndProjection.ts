/**
 * Calculate month-end spending projection based on daily average
 *
 * @param dailyAverage - Average spending per day (VND)
 * @param currentDate - Current date to determine which month to calculate for
 * @returns Projected total spending by end of month (VND, rounded to whole number)
 *
 * @remarks
 * **Timezone Handling:**
 * - This function uses `getFullYear()` and `getMonth()` which operate in local timezone.
 * - For consistent cross-timezone behavior, pass UTC dates (e.g., `new Date('2026-01-15T00:00:00Z')`).
 * - The calculation only depends on year/month, not time-of-day, so timezone impact is minimal.
 * - Recommended: Use UTC dates throughout the application for consistency.
 *
 * @example
 * // January 15, daily average 400,000đ
 * calculateMonthEndProjection(400_000, new Date('2026-01-15'))
 * // Returns: 12,400,000 (400,000 × 31 days)
 *
 * @example
 * // April 15, daily average 400,000đ
 * calculateMonthEndProjection(400_000, new Date('2026-04-15'))
 * // Returns: 12,000,000 (400,000 × 30 days)
 */
export function calculateMonthEndProjection(
  dailyAverage: number,
  currentDate: Date
): number {
  // Get year and month from current date
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate total days in current month
  // Trick: Date(year, month + 1, 0) gives last day of current month
  // month + 1 = next month, day 0 = last day of previous month (current month)
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate projection: daily average × total days in month
  const projection = dailyAverage * totalDaysInMonth;

  // Round to whole VND (no decimals needed)
  return Math.round(projection);
}
