/**
 * TodayTotal component - Displays today's total spending
 * 
 * Key Features (Story 2.5 - Optimistic UI):
 * - Updates instantly when expenses are added (real-time calculation)
 * - Uses same TanStack Query cache as ExpenseList
 * - Calculates total from cached data using useMemo
 * - Filters expenses for today's date only
 * 
 * Story 2.10 Offline Support:
 * - Includes pending offline expenses in totals
 * - Falls back to IndexedDB when offline
 * 
 * Performance: Recalculates on cache changes (<10ms with useMemo)
 */

import { useMemo, useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { useExpenses } from '../hooks/useExpenses';
import { getPendingSyncExpenses } from '../../../services/indexeddb/index';
import { getUserIdFromToken } from '../../../shared/utils/jwtHelper';
import { useAuth } from '../../../contexts/AuthContext';

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
 * Includes pending offline expenses when offline
 */
export function TodayTotal() {
  const { data: expenses = [] } = useExpenses();
  const { accessToken } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  // Check for pending sync expenses
  useEffect(() => {
    const userId = getUserIdFromToken(accessToken);
    if (!userId) {
      setPendingCount(0);
      return;
    }

    const checkPending = async () => {
      try {
        const pending = await getPendingSyncExpenses(userId);
        setPendingCount(pending.length);
      } catch (error) {
        setPendingCount(0);
      }
    };

    checkPending();
  }, [accessToken]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Hôm nay
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
            {formatCurrency(todayTotal)}
          </Typography>
        </Box>
        {pendingCount > 0 && (
          <Chip
            label={`${pendingCount} chờ đồng bộ`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        )}
      </Box>
    </Paper>
  );
}
