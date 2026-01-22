/**
 * ExpenseList component - Real-time expense list display
 * 
 * Key Features (Story 2.5 - Optimistic UI):
 * - Displays expenses instantly when added (optimistic updates)
 * - Uses TanStack Query cache for real-time synchronization
 * - Shows loading skeleton on initial load only
 * - Handles temporary IDs during optimistic updates
 * 
 * Story 2.7 Features:
 * - Groups expenses by date with date headers
 * - Shows daily totals for each group
 * - Displays time for each expense
 * 
 * Performance: Updates instantly when cache changes (<50ms)
 */

import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Alert,
  Skeleton,
  Typography,
} from '@mui/material';
import { getExpenses } from '../api/expensesApi';
import ExpenseListGrouped from './ExpenseListGrouped';

/**
 * ExpenseList component
 * Displays all expenses with real-time updates and grouping by date
 */
export function ExpenseList() {
  const {
    data: expenses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
    staleTime: 5 * 60 * 1000, // 5 minutes (from architecture config)
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });

  // Loading state - Show skeleton on initial load only
  if (isLoading) {
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={60}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error instanceof Error ? error.message : 'Không thể tải danh sách chi tiêu'}
      </Alert>
    );
  }

  // Empty state
  if (expenses.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          px: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Chưa có chi tiêu nào
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nhấn nút + để thêm chi tiêu đầu tiên
        </Typography>
      </Box>
    );
  }

  // Expense list grouped by date with daily totals
  return (
    <Box>
      <ExpenseListGrouped expenses={expenses} />
    </Box>
  );
}
