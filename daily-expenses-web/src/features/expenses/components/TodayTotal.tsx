/**
 * TodayTotal component - Displays today's total spending
 * 
 * Key Features (Story 2.5 - Optimistic UI):
 * - Updates instantly when expenses are added (real-time calculation)
 * - Uses same TanStack Query cache as ExpenseList
 * - Calculates total from cached data using useMemo
 * - Filters expenses for today's date only
 * 
 * Performance: Recalculates on cache changes (<10ms with useMemo)
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper } from '@mui/material';
import { getExpenses } from '../api/expensesApi';

/**
 * Formats currency in Vietnamese dong
 * @param amount - Amount in VND
 * @returns Formatted string with thousands separator
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Gets today's date in ISO format (YYYY-MM-DD) using local timezone
 * @returns Today's date string in local timezone
 */
function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * TodayTotal component
 * Displays the sum of all expenses for today
 */
export function TodayTotal() {
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate today's total from cached data
  const todayTotal = useMemo(() => {
    const today = getTodayDate();
    
    const todayExpenses = expenses.filter((expense) => {
      // Extract date part from expense.date (handle both YYYY-MM-DD and YYYY-MM-DDTHH:mm:ss formats)
      const expenseDate = expense.date.split('T')[0];
      return expenseDate === today;
    });
    
    return todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
        Hôm nay
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
        {formatCurrency(todayTotal)}
      </Typography>
    </Paper>
  );
}
