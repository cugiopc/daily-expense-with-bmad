/**
 * BudgetProgress component - Displays visual progress bar for budget usage
 *
 * Key Features (Acceptance Criteria):
 * - AC 1: Display linear progress bar showing budget usage percentage
 * - AC 2: Color-coded based on thresholds (<80% green, 80-100% yellow, >100% red)
 * - AC 3: Display amount breakdown text below progress bar
 * - AC 4: Real-time updates when expenses change (via React props)
 * - AC 5: Handle over-budget scenario (cap progress bar at 100%, show over amount)
 * - AC 6: Hide component when no budget is set
 * - AC 7: Responsive design and accessibility (aria-labels, full-width)
 * - AC 8: Performance via TanStack Query caching (handled by parent)
 *
 * Design:
 * - Material-UI LinearProgress component (NOT custom progress bar)
 * - Theme tokens for all colors (NEVER hardcoded)
 * - Smooth transitions on value changes (CSS transition)
 * - Vietnamese number formatting with thousands separator
 * - Screen reader support via ARIA attributes
 */

import { Box, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { formatCurrency } from '../../../shared/utils/formatters';
import { getBudgetStatus } from '../utils/budgetStatus';
import type { Budget } from '../types/budget.types';

interface BudgetProgressProps {
  budget: Budget | null;
  monthlyTotal: number;
}

/**
 * BudgetProgress Component
 *
 * Renders budget progress bar with three states:
 * 1. No budget set: Returns null (component hidden)
 * 2. Under/at budget: Shows progress bar with appropriate color
 * 3. Over budget: Shows progress bar at 100% (capped) + "Over budget by X" text
 */
export function BudgetProgress({
  budget,
  monthlyTotal,
}: BudgetProgressProps): JSX.Element | null {
  const theme = useTheme();

  // AC 6: Hide component when no budget set
  if (!budget) {
    return null;
  }

  // AC 1: Calculate percentage (cap at 100% for progress bar display)
  const rawPercentage = (monthlyTotal / budget.amount) * 100;
  const displayPercentage = Math.min(rawPercentage, 100);
  const isOverBudget = monthlyTotal > budget.amount;
  const overAmount = isOverBudget ? monthlyTotal - budget.amount : 0;

  // AC 2: Determine color based on percentage threshold
  const { color, severity } = getBudgetStatus(rawPercentage, theme);

  return (
    <Box
      sx={{
        width: '100%',
        mb: 2,
        px: { xs: 0, sm: 0, md: 0 }, // Full-width on all screens (no padding)
        maxWidth: { xs: '100%', md: 800 }, // Max-width on desktop to prevent stretching
      }}
    >
      {/* AC 1: LinearProgress component with determined value */}
      {/* AC 7: Accessibility - aria attributes for screen readers */}
      <LinearProgress
        variant="determinate"
        value={displayPercentage}
        aria-label={`Sử dụng ngân sách: ${Math.round(displayPercentage)}% của ${formatCurrency(budget.amount)} đã sử dụng`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayPercentage)}
        sx={{
          height: 10, // AC 7: Thicker bar for visibility (default is 4px)
          borderRadius: 5, // Rounded corners for polish
          backgroundColor: alpha(color, 0.2), // Light background track
          '& .MuiLinearProgress-bar': {
            backgroundColor: color, // AC 2: Filled portion color from theme
            borderRadius: 5,
            transition: 'all 0.3s ease-in-out', // AC 4: Smooth animation on update
          },
        }}
      />

      {/* AC 3: Display amount breakdown below progress bar */}
      <Box sx={{ mt: 1 }}>
        {/* Amount used text - aligned with progress bar */}
        <Typography variant="body2" sx={{ color }}>
          {formatCurrency(monthlyTotal)} của {formatCurrency(budget.amount)} đã sử dụng
        </Typography>

        {/* AC 5: Show "Over budget by X" when over 100% */}
        {isOverBudget && (
          <Typography variant="body2" sx={{ color, fontWeight: 'bold', mt: 0.5 }}>
            Vượt quá ngân sách {formatCurrency(overAmount)}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
