// EditExpenseDialog component for editing existing expenses
// Story 2.8: Edit Expense Functionality

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ExpenseForm } from './ExpenseForm';
import type { Expense } from '../types/expense.types';

interface EditExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}

/**
 * Dialog for editing an existing expense
 * 
 * Features (from AC):
 * - Opens with current expense values pre-filled
 * - Reuses ExpenseForm component
 * - Save button updates expense with PUT /api/expenses/{id}
 * - Cancel button closes dialog without changes
 * - Optimistic UI updates list and totals immediately
 * - Error handling with rollback on failure
 * 
 * Performance: <100ms to open dialog, <50ms to update UI
 */
export function EditExpenseDialog({ open, expense, onClose }: EditExpenseDialogProps) {
  if (!expense) return null;

  // Extract date portion from ISO datetime string (YYYY-MM-DD)
  // This handles timezone issues by using the date part directly
  const dateOnly = expense.date.split('T')[0];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      aria-labelledby="edit-expense-dialog-title"
    >
      <DialogTitle id="edit-expense-dialog-title">
        Sửa chi tiêu
      </DialogTitle>
      
      <DialogContent>
        <ExpenseForm 
          initialValues={{
            amount: expense.amount,
            note: expense.note || '',
            date: dateOnly
          }}
          expenseId={expense.id}
          onSuccess={onClose}
          submitButtonText="Lưu thay đổi"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
