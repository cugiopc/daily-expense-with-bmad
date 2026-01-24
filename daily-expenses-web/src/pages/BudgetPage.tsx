// Budget page for setting monthly budget
// Story 3.2: Set Monthly Budget API and UI

import { Typography, Box, Container, Card, CardContent, CircularProgress } from '@mui/material';
import { BudgetForm } from '../features/budgets';
import { useCurrentBudget } from '../features/budgets';

export function BudgetPage(): JSX.Element {
  // Fetch current budget to pre-fill form
  const { data: currentBudget, isLoading, error } = useCurrentBudget();

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Ngân sách tháng
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Đặt ngân sách chi tiêu cho tháng này
        </Typography>

        <Card>
          <CardContent>
            {isLoading ? (
              // Loading state while fetching current budget
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              // Error state if fetch fails (other than 404)
              <Box sx={{ py: 3 }}>
                <Typography color="error" variant="body2">
                  Không thể tải ngân sách hiện tại. Vui lòng thử lại.
                </Typography>
                <BudgetForm
                  onSuccess={() => {
                    // Form handles success toast and query invalidation
                  }}
                />
              </Box>
            ) : (
              // BudgetForm with pre-filled amount if budget exists
              <BudgetForm
                initialAmount={currentBudget?.amount ?? undefined}
                onSuccess={() => {
                  // Form handles success toast and query invalidation
                  // No need for additional action here
                }}
              />
            )}

            {/* Show current budget info if exists */}
            {currentBudget && !isLoading && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Ngân sách hiện tại: {currentBudget.amount.toLocaleString('vi-VN')} đ
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tháng: {new Date(currentBudget.month).toLocaleDateString('vi-VN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
