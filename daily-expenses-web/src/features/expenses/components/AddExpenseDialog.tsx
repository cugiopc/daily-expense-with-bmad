// AddExpenseDialog wrapper component
// Displays ExpenseForm in a modal dialog (recommended for mobile UX)

import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ExpenseForm } from './ExpenseForm';

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * AddExpenseDialog component
 * 
 * Features:
 * - Opens when FAB is tapped
 * - Shows ExpenseForm in a modal dialog
 * - Close button (X icon) in header
 * - Auto-closes after successful submission
 * - Responsive for mobile and desktop
 * 
 * UX Design (from Architecture Doc UX3):
 * - Dialog provides focused context for expense entry
 * - Prevents distractions from background content
 * - Mobile-friendly with full-width on small screens
 */
export function AddExpenseDialog({ open, onClose }: AddExpenseDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // Responsive: full-screen on mobile (<600px), dialog on desktop
      fullScreen={false}
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 1, sm: 2 },
          maxHeight: { xs: '95vh', sm: '80vh' },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingRight: 1,
        }}
      >
        Thêm chi tiêu
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Pass onClose to form so it can close dialog after successful submission */}
        <ExpenseForm onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
