import { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Expense } from '../types';
import { useExpensesGroupedByDay } from '../hooks/useExpensesGroupedByDay';
import { getDateHeader, formatCurrency, formatTime } from '../hooks/formatters';
import { EditExpenseDialog } from './EditExpenseDialog';
import { DeleteExpenseDialog } from './DeleteExpenseDialog';
import { useDeleteExpense } from '../hooks/useDeleteExpense';
import './ExpenseListGrouped.css';

interface ExpenseListGroupedProps {
  expenses: Expense[] | undefined;
}

/**
 * Displays expenses grouped by day with date headers and daily totals
 * Supports clicking on expenses to edit them (Story 2.8)
 * Supports swipe-to-delete functionality (Story 2.9)
 */
export default function ExpenseListGrouped({ expenses }: ExpenseListGroupedProps): React.ReactElement | null {
  const groupedExpenses = useExpensesGroupedByDay(expenses);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Swipe and delete state
  const [swipedExpenseId, setSwipedExpenseId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Delete mutation hook
  const { mutate: deleteExpenseMutation, isPending: isDeleting } = useDeleteExpense();

  // Handle expense click for edit (only if not swiped)
  const handleExpenseClick = useCallback((expense: Expense) => {
    if (swipedExpenseId === expense.id) {
      // If this expense is swiped, clicking closes the swipe
      setSwipedExpenseId(null);
      return;
    }
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  }, [swipedExpenseId]);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setSelectedExpense(null);
  }, []);

  // Handle delete button tap
  const handleDeleteTap = useCallback((e: React.MouseEvent, expenseId: string) => {
    e.stopPropagation(); // Prevent triggering edit
    setConfirmDeleteId(expenseId);
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    if (!confirmDeleteId) return;

    deleteExpenseMutation(confirmDeleteId, {
      onSuccess: () => {
        setConfirmDeleteId(null);
        setSwipedExpenseId(null);
      },
    });
  }, [confirmDeleteId, deleteExpenseMutation]);

  // Handle delete cancel
  const handleDeleteCancel = useCallback(() => {
    setConfirmDeleteId(null);
    setSwipedExpenseId(null);
  }, []);

  // Close swipe on scroll
  useEffect(() => {
    const handleScroll = (): void => {
      if (swipedExpenseId) {
        setSwipedExpenseId(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [swipedExpenseId]);

  // Close swipe on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Element;
      if (swipedExpenseId && !target.closest('.expense-item.swiped')) {
        setSwipedExpenseId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [swipedExpenseId]);

  // Create base swipe handlers - called once at component level
  const baseSwipeHandlers = useSwipeable({
    onSwipedLeft: (event) => {
      const expenseId = (event.event.currentTarget as HTMLElement).closest('.expense-item')?.getAttribute('data-expense-id');
      if (expenseId) setSwipedExpenseId(expenseId);
    },
    onSwipedRight: () => setSwipedExpenseId(null),
    trackMouse: true, // Allow mouse swipe for desktop testing
    delta: 50, // Minimum swipe distance in pixels
    preventScrollOnSwipe: true,
  });

  // Find expense for delete dialog
  const expenseToDelete = confirmDeleteId
    ? expenses?.find(e => e.id === confirmDeleteId) ?? null
    : null;

  if (!groupedExpenses || groupedExpenses.length === 0) {
    return null;
  }

  return (
    <div className="expense-list-grouped">
      {groupedExpenses.map((group) => (
        <section key={group.date} className="expense-group">
          {/* Date Header with Daily Total */}
          <header className="expense-group-header">
            <h3 className="expense-group-date">{getDateHeader(group.date)}</h3>
            <span className="expense-group-total">{formatCurrency(group.total)}</span>
          </header>

          {/* Expense List */}
          <ul className="expense-list" role="list">
            {group.expenses.map((expense) => {
              const isSwiped = swipedExpenseId === expense.id;

              return (
                <li
                  key={expense.id}
                  {...baseSwipeHandlers}
                  data-expense-id={expense.id}
                  className={`expense-item ${isSwiped ? 'swiped' : ''}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleExpenseClick(expense);
                    }
                  }}
                >
                  <div
                    className="expense-content"
                    onClick={() => handleExpenseClick(expense)}
                  >
                    <div className="expense-item-main">
                      <time className="expense-time">{formatTime(expense.createdAt)}</time>
                      <span className="expense-note">
                        {expense.note}
                        {expense.pending_sync && (
                          <span className="pending-badge" title="Đang chờ đồng bộ">
                            ⏳
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                  </div>

                  {/* Delete button (revealed on swipe) */}
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteTap(e, expense.id)}
                    aria-label="Xóa chi tiêu"
                  >
                    Xóa
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Edit Dialog */}
      <EditExpenseDialog
        open={editDialogOpen}
        expense={selectedExpense}
        onClose={handleCloseEditDialog}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteExpenseDialog
        open={confirmDeleteId !== null}
        expense={expenseToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
