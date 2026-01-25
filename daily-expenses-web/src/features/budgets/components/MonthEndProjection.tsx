import { Box, Typography } from '@mui/material';
import { calculateMonthEndProjection } from '../utils/calculateMonthEndProjection';
import { getBudgetProjectionStatus } from '../utils/budgetComparison';
import { formatCurrency } from '../../../shared/utils/formatters';

/**
 * Props for MonthEndProjection component
 */
export interface MonthEndProjectionProps {
  /**
   * Average spending per day (VND)
   */
  dailyAverage: number;

  /**
   * Monthly budget amount (VND), or null if no budget set
   */
  budget: number | null;
}

/**
 * MonthEndProjection Component
 *
 * Displays projected month-end spending based on current daily average,
 * with warning/success messages when compared to budget.
 *
 * @example
 * <MonthEndProjection dailyAverage={400_000} budget={10_000_000} />
 * // Displays: "Dự kiến cuối tháng: 12.400.000 ₫"
 * // Warning: "Dự kiến vượt ngân sách 2.400.000 ₫" (orange)
 *
 * @example
 * <MonthEndProjection dailyAverage={400_000} budget={null} />
 * // Displays: "Dự kiến cuối tháng: 12.400.000 ₫"
 * // No warning/success message (no budget to compare)
 */
export function MonthEndProjection({ dailyAverage, budget }: MonthEndProjectionProps): JSX.Element {
  // Calculate current date for projection
  const today = new Date();

  // Calculate month-end projection based on daily average
  const projection = calculateMonthEndProjection(dailyAverage, today);

  // Get budget comparison status (warning, success, or none)
  const status = getBudgetProjectionStatus(projection, budget);

  return (
    <Box
      sx={{
        width: '100%',
        mb: 2,
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: { xs: '100%', md: 800 },
      }}
    >
      {/* Projection display */}
      <Typography
        variant="body1"
        aria-label={`Projected month end spending: ${formatCurrency(projection)} dong`}
      >
        Dự kiến cuối tháng: <strong>{formatCurrency(projection)}</strong>
      </Typography>

      {/* Warning/success message (conditional) */}
      {status.severity !== 'none' && (
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            color: status.severity === 'warning' ? 'warning.main' : 'success.main',
          }}
        >
          {status.message}
        </Typography>
      )}
    </Box>
  );
}
