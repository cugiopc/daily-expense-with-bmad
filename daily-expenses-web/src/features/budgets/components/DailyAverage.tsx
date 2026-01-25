import { Box, Typography } from '@mui/material';
import { calculateDailyAverage } from '../utils/calculateDailyAverage';
import { formatCurrency } from '../../../shared/utils/formatters';

export interface DailyAverageProps {
  monthlyTotal: number;
}

// Convert VND to thousands for readable aria-label (e.g., 400,000đ → "400 nghìn đồng")
const THOUSANDS_DIVISOR = 1000;

/**
 * DailyAverage Component
 * Displays the daily spending average for the current month
 *
 * Calculation: monthlyTotal / daysElapsed (days elapsed = current day of month)
 * Updates automatically when monthlyTotal changes (via React reactivity)
 *
 * Note: Uses system date (new Date()) which updates on fresh page load.
 * AC 5 "daily average updates automatically each new day" means when user
 * reopens app the next day, not continuous updates past midnight in same session.
 */
export function DailyAverage({ monthlyTotal }: DailyAverageProps): JSX.Element {
  const today = new Date();
  const dailyAverage = calculateDailyAverage(monthlyTotal, today);

  // Vietnamese aria-label for consistency with UI text
  const amountInThousands = Math.round(dailyAverage / THOUSANDS_DIVISOR);
  const ariaLabel = `Trung bình chi tiêu mỗi ngày: ${amountInThousands} nghìn đồng mỗi ngày`;

  return (
    <Box
      sx={{
        width: '100%',
        mb: 2,
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: { xs: '100%', md: 800 },
      }}
    >
      <Typography variant="body1" aria-label={ariaLabel}>
        Trung bình mỗi ngày: <strong>{formatCurrency(dailyAverage)}</strong>
      </Typography>
    </Box>
  );
}
