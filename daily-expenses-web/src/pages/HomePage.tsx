import { useState } from 'react';
import { Typography, Box, Container, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AddExpenseDialog } from '../features/expenses/components/AddExpenseDialog';
import { ExpenseList } from '../features/expenses/components/ExpenseList';
import { TodayTotal } from '../features/expenses/components/TodayTotal';
import { MonthlyTotal } from '../features/expenses/components/MonthlyTotal';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { PendingChangesIndicator } from '../components/PendingChangesIndicator';
import { useAutoSync } from '../hooks/useAutoSync';
import { useAuth } from '../contexts/AuthContext';
import { getUserIdFromToken } from '../shared/utils/jwtHelper';

export function HomePage(): JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { accessToken } = useAuth();
  const userId = getUserIdFromToken(accessToken);

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
