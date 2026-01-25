import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Container, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { isThisMonth } from 'date-fns';
import { AddExpenseDialog } from '../features/expenses/components/AddExpenseDialog';
import { ExpenseList } from '../features/expenses/components/ExpenseList';
import { TodayTotal } from '../features/expenses/components/TodayTotal';
import { MonthlyTotal } from '../features/expenses/components/MonthlyTotal';
import { BudgetDisplay, BudgetProgress, DailyAverage, MonthEndProjection, useCurrentBudget } from '../features/budgets';
import { calculateDailyAverage } from '../features/budgets/utils/calculateDailyAverage';
import { useExpenses } from '../features/expenses/hooks/useExpenses';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { PendingChangesIndicator } from '../components/PendingChangesIndicator';
import { useAutoSync } from '../hooks/useAutoSync';
import { useAuth } from '../contexts/AuthContext';
import { getUserIdFromToken } from '../shared/utils/jwtHelper';

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { accessToken } = useAuth();
  const userId = getUserIdFromToken(accessToken);

  // Fetch budget and expenses data
  const { data: budget } = useCurrentBudget();
  const { data: expenses = [] } = useExpenses();

  // Calculate monthly total from expenses
  // Uses date-fns isThisMonth to handle timezone edge cases correctly (AC 6)
  const monthlyTotal = useMemo(() => {
    return expenses
      .filter((expense) => isThisMonth(new Date(expense.date)))
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Calculate daily average for month-end projection
  const dailyAverage = useMemo(() => {
    return calculateDailyAverage(monthlyTotal, new Date());
  }, [monthlyTotal]);

  // Auto-sync offline expenses when connection restores
  useAutoSync(userId || undefined);

  return (
    <>
      {/* Offline indicator banner */}
      <ConnectionIndicator />

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Daily Expenses
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Theo dõi chi tiêu hàng ngày của bạn
          </Typography>

          {/* Pending changes indicator */}
          <PendingChangesIndicator />

          {/* Budget Display - Real-time remaining budget calculation */}
          <BudgetDisplay
            budget={budget || null}
            monthlyTotal={monthlyTotal}
            onSetBudget={() => navigate('/budget')}
          />

          {/* Budget Progress Bar - Visual progress indicator for budget usage */}
          <BudgetProgress budget={budget || null} monthlyTotal={monthlyTotal} />

          {/* Daily Spending Average - Shows spending pace for the month */}
          <DailyAverage monthlyTotal={monthlyTotal} />

          {/* Month-End Projection - Projected spending by month end based on daily average */}
          <MonthEndProjection dailyAverage={dailyAverage} budget={budget?.amount || null} />

          {/* Today and Monthly Totals - Real-time updates */}
          <TodayTotal />
          <MonthlyTotal />

          {/* Expense List - Real-time updates with optimistic UI */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Danh sách chi tiêu
          </Typography>
          <ExpenseList />
        </Box>
      </Container>

      {/* Floating Action Button (FAB) - Primary action for adding expenses */}
      {/* AC: FAB in bottom-right, uses Material-UI Fab with "+" icon */}
      <Fab
        color="primary"
        aria-label="thêm chi tiêu"
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16, // 16px from bottom
          right: 16,  // 16px from right
          zIndex: 1000, // Ensure FAB is above other content
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialog opens when FAB is tapped */}
      <AddExpenseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
