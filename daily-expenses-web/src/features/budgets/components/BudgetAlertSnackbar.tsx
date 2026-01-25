import { useEffect } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface BudgetAlertSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Budget Alert Snackbar Component
 *
 * Displays non-intrusive budget alerts (80% threshold or over-budget)
 * at the bottom of the screen. Auto-dismisses after 7 seconds or can be
 * manually closed.
 *
 * Features:
 * - Material-UI Snackbar with Alert
 * - Warning severity (yellow/orange) for 80% threshold
 * - Error severity (red) for over-budget (100% threshold)
 * - Auto-dismiss after 7 seconds
 * - Manual close button
 * - Full accessibility support (ARIA attributes, screen reader announcements)
 * - Responsive positioning (bottom-center)
 *
 * @param open - Whether snackbar is visible
 * @param onClose - Callback when snackbar should close
 * @param message - Alert message text (Vietnamese)
 * @param severity - Alert severity level (warning or error)
 *
 * @example
 * <BudgetAlertSnackbar
 *   open={alertOpen}
 *   onClose={() => setAlertOpen(false)}
 *   message="Cảnh báo ngân sách: Bạn đã dùng 80% ngân sách tháng này (12M / 15M)"
 *   severity="warning"
 * />
 */
export function BudgetAlertSnackbar({
  open,
  onClose,
  message,
  severity,
}: BudgetAlertSnackbarProps): JSX.Element {
  // AC 14: Keyboard accessibility - Esc key dismisses snackbar
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onClose]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={7000} // 7 seconds (AC 4)
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // AC 10
      sx={{
        // Responsive max-width (AC 10)
        maxWidth: { xs: '100%', sm: 600 },
        // Spacing from bottom (AC 10)
        bottom: { xs: 16, sm: 24 },
      }}
    >
      <Alert
        severity={severity} // warning or error (AC 3)
        role="alert" // AC 14
        aria-live="assertive" // AC 14 - immediate announcement
        action={
          // Manual close button (AC 5)
          <IconButton
            aria-label="Close budget alert" // AC 14
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          width: '100%',
          // Ensure text color contrast for accessibility (AC 3)
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
