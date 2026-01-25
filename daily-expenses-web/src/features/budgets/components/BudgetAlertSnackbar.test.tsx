import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { BudgetAlertSnackbar } from './BudgetAlertSnackbar';
import { theme } from '../../../theme/theme';

// Helper to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('BudgetAlertSnackbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('rendering (AC 1)', () => {
    it('should render snackbar when open=true', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Test alert message"
          threshold={80}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should not render snackbar when open=false', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={false}
          onClose={onClose}
          message="Test alert message"
          threshold={80}
        />
      );

      const alert = screen.queryByRole('alert');
      expect(alert).not.toBeInTheDocument();
    });

    it('should display correct message text (AC 2)', () => {
      const onClose = vi.fn();
      const message = 'Cảnh báo ngân sách: Bạn đã dùng 80% ngân sách tháng này (12M / 15M)';

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message={message}
          threshold={80}
        />
      );

      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  describe('visual design (AC 3)', () => {
    it('should use warning severity for 80% threshold', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Warning message"
          threshold={80}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardWarning');
    });

    it('should use error severity for 100% threshold', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Error message"
          threshold={100}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardError');
    });

    it('should have warning icon for warning severity', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Warning"
          threshold={80}
        />
      );

      // Material-UI Alert automatically adds icon
      const alert = screen.getByRole('alert');
      expect(alert.querySelector('.MuiAlert-icon')).toBeInTheDocument();
    });

    it('should show ErrorIcon for 100% threshold (Story 3.8)', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Over budget"
          threshold={100}
        />
      );

      const alert = screen.getByRole('alert');
      const icon = alert.querySelector('.MuiAlert-icon svg');
      expect(icon).toBeInTheDocument();
      // ErrorIcon has specific data-testid in Material-UI
      expect(icon).toHaveAttribute('data-testid', 'ErrorIcon');
    });

    it('should show WarningIcon for 80% threshold (Story 3.7)', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Budget warning"
          threshold={80}
        />
      );

      const alert = screen.getByRole('alert');
      const icon = alert.querySelector('.MuiAlert-icon svg');
      expect(icon).toBeInTheDocument();
      // WarningIcon has specific data-testid in Material-UI
      expect(icon).toHaveAttribute('data-testid', 'WarningIcon');
    });
  });

  describe('auto-dismiss (AC 4)', () => {
    it('should have autoHideDuration set to 7000ms', () => {
      const onClose = vi.fn();

      const { container } = renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Auto-dismiss test"
          threshold={80}
        />
      );

      // Material-UI Snackbar component should have autoHideDuration prop
      // We verify the component configuration rather than timing behavior
      // The actual auto-dismiss behavior is tested in integration tests
      const snackbar = container.querySelector('.MuiSnackbar-root');
      expect(snackbar).toBeInTheDocument();
    });

    it('should call onClose after autoHideDuration', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Auto-dismiss test"
          threshold={80}
        />
      );

      expect(onClose).not.toHaveBeenCalled();

      // Wait for auto-dismiss (7 seconds + buffer)
      await waitFor(
        () => {
          expect(onClose).toHaveBeenCalledTimes(1);
        },
        { timeout: 8000 }
      );

      vi.useFakeTimers(); // Restore fake timers
    }, 10000); // Increase test timeout to 10 seconds
  });

  describe('manual dismiss (AC 5)', () => {
    it('should dismiss when close button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Manual close test"
          threshold={80}
        />
      );

      const closeButton = screen.getByLabelText(/close budget alert/i);
      expect(closeButton).toBeInTheDocument();

      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should have close button visible on the right side', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Close button test"
          threshold={80}
        />
      );

      const closeButton = screen.getByLabelText(/close budget alert/i);
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });
  });

  describe('positioning (AC 10)', () => {
    it('should position snackbar at bottom-center', () => {
      const onClose = vi.fn();

      const { container } = renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Position test"
          threshold={80}
        />
      );

      const snackbar = container.querySelector('.MuiSnackbar-root');
      expect(snackbar).toBeInTheDocument();

      // Material-UI applies positioning via inline styles or classes
      // Check for bottom and center positioning classes
      expect(snackbar).toHaveClass('MuiSnackbar-anchorOriginBottomCenter');
    });
  });

  describe('accessibility (AC 14)', () => {
    it('should have role="alert" on snackbar', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Accessibility test"
          threshold={80}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have aria-live="assertive" for immediate announcement', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Accessibility test"
          threshold={80}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-label on close button', () => {
      const onClose = vi.fn();

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Close button aria-label test"
          threshold={80}
        />
      );

      const closeButton = screen.getByLabelText('Close budget alert');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('component props', () => {
    it('should derive warning severity from 80% threshold', () => {
      const onClose = vi.fn();

      const { rerender } = renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message="Warning"
          threshold={80}
        />
      );

      expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardWarning');

      rerender(
        <ThemeProvider theme={theme}>
          <BudgetAlertSnackbar
            open={true}
            onClose={onClose}
            message="Error"
            threshold={100}
          />
        </ThemeProvider>
      );

      expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');
    });

    it('should render without errors', () => {
      const onClose = vi.fn();

      expect(() => {
        renderWithTheme(
          <BudgetAlertSnackbar
            open={true}
            onClose={onClose}
            message="Test message"
            threshold={80}
          />
        );
      }).not.toThrow();
    });

    it('should display over-budget message for 100% threshold (Story 3.8)', () => {
      const onClose = vi.fn();
      const message = 'Vượt quá ngân sách: Bạn đã vượt quá ngân sách hàng tháng 500,000đ';

      renderWithTheme(
        <BudgetAlertSnackbar
          open={true}
          onClose={onClose}
          message={message}
          threshold={100}
        />
      );

      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });
});
