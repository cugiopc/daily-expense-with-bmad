/**
 * Currency formatting utilities
 * Centralized formatting for Vietnamese Dong (VND)
 *
 * Rules (from project-context.md):
 * - Vietnamese Dong: NEVER show decimals (always whole amounts)
 * - Thousands separator: 1,000,000đ (NOT 1000000đ)
 * - Use Intl.NumberFormat or toLocaleString('vi-VN')
 * - Test edge cases: 0, negative, 1M+, decimal values
 */

/**
 * Format currency in Vietnamese Dong
 * @param amount - Number to format
 * @returns Formatted currency string with thousands separator and đ symbol
 *
 * @example
 * formatCurrency(15000000) → "15.000.000₫"
 * formatCurrency(1234.56) → "1.235₫" (rounded)
 * formatCurrency(0) → "0₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
