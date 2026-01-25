/**
 * Date helper utilities for budget alert system
 */

/**
 * Get current month in YYYY-MM format
 *
 * Used for month change detection in budget alert system.
 * When month changes, alert states are reset.
 *
 * @returns Current month string (e.g., "2026-01")
 *
 * @example
 * getCurrentMonth() // → "2026-01"
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
