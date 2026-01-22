/**
 * MonthlyTotal component - Displays current month's total spending
 * 
 * Key Features (Story 2.5 - Optimistic UI):
 * - Updates instantly when expenses are added (real-time calculation)
 * - Uses same TanStack Query cache as ExpenseList
 * - Calculates total from cached data using useMemo
 * - Filters expenses for current month and year
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
 * Gets current month and year
 * @returns Object with month (1-12) and year
 */
function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // getMonth() returns 0-11
    year: now.getFullYear(),
  };
}

/**
 * Gets month name in Vietnamese
 * @param month - Month number (1-12)
 * @returns Vietnamese month name
 */
function getMonthName(month: number): string {
  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];
  return monthNames[month - 1];
}

/**
 * MonthlyTotal component
 * Displays the sum of all expenses for the current month
 */
export function MonthlyTotal() {
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate monthly total from cached data
  const monthlyTotal = useMemo(() => {
    const { month, year } = getCurrentMonthYear();
    
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() + 1 === month &&
          expenseDate.getFullYear() === year
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const { month } = getCurrentMonthYear();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
        {getMonthName(month)}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
        {formatCurrency(monthlyTotal)}
      </Typography>
    </Paper>
  );
}
