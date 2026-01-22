import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../hooks/formatters';
import type { Expense } from '../types/expense.types';

interface DeleteExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

/**
 * Confirmation dialog for deleting an expense
 * Follows Material Design patterns for destructive actions:
 * - Cancel on left, Delete on right
 * - Red Delete button signals destructive action
 * - Shows expense details so user can verify before deleting
 * - "Cannot be undone" warning
 */
export function DeleteExpenseDialog({
  open,
  expense,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteExpenseDialogProps): React.ReactElement | null {
  if (!expense) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-expense-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="delete-expense-dialog-title">
        Xóa chi tiêu này?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {formatCurrency(expense.amount)} - {expense.note || 'Không có ghi chú'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Hành động này không thể hoàn tác.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          color="inherit"
        >
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          color="error"
          variant="contained"
          autoFocus
        >
          {isDeleting ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
