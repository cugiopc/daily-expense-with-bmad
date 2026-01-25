/**
 * Budget status utility - Determines color and status based on percentage
 *
 * Color Thresholds:
 * - < 80%: Green (success) - "Đang theo dõi"
 * - 80-100%: Yellow/Orange (warning) - "Gần đạt giới hạn"
 * - > 100%: Red (error) - "Vượt quá ngân sách"
 *
 * CRITICAL: Use theme tokens, NEVER hardcoded colors
 */

import type { Theme } from '@mui/material/styles';

interface BudgetStatus {
  color: string;
  label: string;
  severity: 'success' | 'warning' | 'error';
}

/**
 * Get budget status based on percentage spent
 * @param percentage - Percentage of budget used (0-100+)
 * @param theme - Material-UI theme object for color tokens
 * @returns Object with color, label, and severity
 *
 * @example
 * getBudgetStatus(50, theme) → { color: green, label: "Đang theo dõi", severity: "success" }
 * getBudgetStatus(85, theme) → { color: yellow, label: "Gần đạt giới hạn", severity: "warning" }
 * getBudgetStatus(107, theme) → { color: red, label: "Vượt quá ngân sách", severity: "error" }
 */
export function getBudgetStatus(percentage: number, theme: Theme): BudgetStatus {
  // Green: < 80% of budget used
  if (percentage < 80) {
    return {
      color: theme.palette.success.main, // #4CAF50 (Material Design Green 500)
      label: 'Đang theo dõi',
      severity: 'success',
    };
  }

  // Yellow/Orange: 80-100% of budget used
  if (percentage <= 100) {
    return {
      color: theme.palette.warning.main, // #FF9800 (Material Design Orange 500)
      label: 'Gần đạt giới hạn',
      severity: 'warning',
    };
  }

  // Red: > 100% of budget used
  return {
    color: theme.palette.error.main, // #F44336 (Material Design Red 500)
    label: 'Vượt quá ngân sách',
    severity: 'error',
  };
}
