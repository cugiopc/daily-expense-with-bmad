/**
 * BudgetDisplay component - Displays remaining monthly budget
 *
 * Key Features (Acceptance Criteria):
 * - AC 1: Display remaining budget with thousands separator when under budget
 * - AC 3: Show "Over Budget" in warning color when exceeded
 * - AC 4: Show "Set a budget" empty state with action button
 * - AC 8: Format Vietnamese Dong with thousands separator, no decimals
 *
 * Design:
 * - Card-based layout using Material-UI Paper
 * - Green color for under budget (theme.palette.success.main)
 * - Red/Orange color for over budget (theme.palette.error.main)
 * - Responsive design: Full width on mobile, centered on larger screens
 * - 44pt touch target for accessibility
 * - Screen reader support via aria-labels for blind/visually impaired users
 */

import { Box, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { Budget } from '../types/budget.types';

interface BudgetDisplayProps {
  budget: Budget | null;
  monthlyTotal: number;
  onSetBudget?: () => void; // Optional callback to navigate to budget setting page
}

/**
 * BudgetDisplay Component
 *
 * Renders budget information with three states:
 * 1. No budget set: Empty state with "Set Budget" action
 * 2. Under budget: Shows remaining amount in green
 * 3. Over budget: Shows overspend amount in red/warning color
 */
export function BudgetDisplay({
  budget,
  monthlyTotal,
  onSetBudget,
}: BudgetDisplayProps): JSX.Element {
  const theme = useTheme();

  // Empty state: No budget set
  if (!budget) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mb: 2,
          background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.lighter ?? theme.palette.info.light} 100%)`,
          borderRadius: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" sx={{ mb: 1.5, color: 'text.secondary' }}>
          Hãy đặt ngân sách để theo dõi chi tiêu của bạn
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={onSetBudget}
          sx={{
            minHeight: 44, // 44pt touch target (accessibility)
            px: 3,
            fontWeight: 'bold',
          }}
        >
          Đặt ngân sách
        </Button>
      </Paper>
    );
  }

  // Calculate remaining budget
  const remainingBudget = budget.amount - monthlyTotal;
  const isOverBudget = remainingBudget < 0;
  const overAmount = Math.abs(remainingBudget);

  // Determine color based on budget status
  const statusColor = isOverBudget
    ? theme.palette.error.main // Red for overspend
    : theme.palette.success.main; // Green for under budget

  // Over budget state: Display overspend amount
  if (isOverBudget) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 1,
          borderLeft: `4px solid ${theme.palette.error.main}`,
          background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.lighter ?? theme.palette.error.light} 100%)`,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          Vượt quá ngân sách
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: statusColor,
            }}
            aria-label={`Vượt quá ${formatCurrency(overAmount)} so với ngân sách ${formatCurrency(budget.amount)}`}
          >
            {formatCurrency(overAmount)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            vượt quá {formatCurrency(budget.amount)}
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Under budget state: Display remaining amount
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 1,
        borderLeft: `4px solid ${theme.palette.success.main}`,
        background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.lighter ?? theme.palette.success.light} 100%)`,
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
        Ngân sách
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: statusColor,
          }}
          aria-label={`${formatCurrency(remainingBudget)} còn lại của ${formatCurrency(budget.amount)} ngân sách hàng tháng`}
        >
          {formatCurrency(remainingBudget)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          còn lại của {formatCurrency(budget.amount)}
        </Typography>
      </Box>
    </Paper>
  );
}
