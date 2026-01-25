/**
 * Determines if a budget alert should be triggered based on threshold crossing.
 *
 * Alert triggers ONLY when:
 * 1. Previous total was BELOW threshold
 * 2. New total is AT or ABOVE threshold
 * 3. Alert has not been triggered before (hasTriggered = false)
 *
 * This ensures alerts show exactly once when crossing the threshold.
 *
 * @param previousTotal - Previous monthly total before change (VND)
 * @param newTotal - New monthly total after change (VND)
 * @param budget - Monthly budget amount (VND)
 * @param threshold - Percentage threshold (e.g., 80 for 80%)
 * @param hasTriggered - Whether alert has already been triggered
 * @returns true if alert should trigger, false otherwise
 *
 * @example
 * // Crossing 80% threshold
 * shouldTriggerBudgetAlert(11_000_000, 12_500_000, 15_000_000, 80, false)
 * // → true (went from 73% to 83%, crosses 80%)
 *
 * @example
 * // Already above threshold
 * shouldTriggerBudgetAlert(13_000_000, 14_000_000, 15_000_000, 80, false)
 * // → false (went from 87% to 93%, already above 80%)
 */
export function shouldTriggerBudgetAlert(
  previousTotal: number,
  newTotal: number,
  budget: number,
  threshold: number,
  hasTriggered: boolean
): boolean {
  // Edge case: No budget or invalid values
  if (!budget || budget <= 0) {
    return false;
  }

  // Edge case: Already triggered
  if (hasTriggered) {
    return false;
  }

  // Edge case: NaN values
  if (Number.isNaN(previousTotal) || Number.isNaN(newTotal)) {
    return false;
  }

  // Calculate percentages
  const previousPercentage = (previousTotal / budget) * 100;
  const newPercentage = (newTotal / budget) * 100;

  // Trigger if crossing threshold from below
  const crossedThreshold =
    previousPercentage < threshold && newPercentage >= threshold;

  return crossedThreshold;
}
