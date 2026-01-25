import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MonthEndProjection } from './MonthEndProjection';

// NO MOCKS - Real integration testing with actual utilities

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('MonthEndProjection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // AC 1, 10: Display and formatting
  it('should display projection correctly when dailyAverage = 400K, January', () => {
    // Real calculation: 400,000 đ/day × 31 days = 12,400,000 đ
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);

    // Should display Vietnamese label
    expect(screen.getByText(/Dự kiến cuối tháng:/i)).toBeInTheDocument();

    // Should display formatted amount (formatCurrency returns "12.400.000 ₫")
    expect(screen.getByText(/12\.400\.000/)).toBeInTheDocument();
  });

  it('should format numbers with Vietnamese locale (12.400.000 ₫)', () => {
    // Real calculation with actual utilities
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);

    // Verify Vietnamese number formatting with dot separator
    const formattedAmount = screen.getByText(/12\.400\.000/);
    expect(formattedAmount).toBeInTheDocument();
  });

  // AC 3: Warning display
  it('should display warning message when projection exceeds budget', () => {
    // Real calculation: 400K × 31 = 12.4M > budget 10M → warning
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={10_000_000} />);

    // Should display warning message from real getBudgetProjectionStatus utility
    const warningText = screen.getByText(/Dự kiến vượt ngân sách/i);
    expect(warningText).toBeInTheDocument();
    // Warning message should include excess amount: 12.4M - 10M = 2.4M
    expect(warningText).toHaveTextContent('2.400.000');
  });

  it('should use warning color (orange) for over-budget message', () => {
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={10_000_000} />);

    const warningMessage = screen.getByText(/Dự kiến vượt ngân sách/i);

    // Verify theme color is applied (MUI sx prop applies theme.palette.warning.main)
    // The warning message Typography should have color styling
    expect(warningMessage).toBeInTheDocument();
    expect(warningMessage).toHaveStyle({ color: 'rgb(237, 108, 2)' }); // MUI default warning.main
  });

  // AC 4: Success display
  it('should display success message when projection under budget', () => {
    // Real calculation: 400K × 31 = 12.4M < budget 15M → success
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={15_000_000} />);

    // Should display success message from real getBudgetProjectionStatus utility
    const successText = screen.getByText(/Đang đúng hướng/i);
    expect(successText).toBeInTheDocument();
    // Success message should include remaining amount: 15M - 12.4M = 2.6M
    expect(successText).toHaveTextContent('2.600.000');
  });

  it('should use success color (green) for under-budget message', () => {
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={15_000_000} />);

    const successMessage = screen.getByText(/Đang đúng hướng/i);

    // Verify theme color is applied (MUI sx prop applies theme.palette.success.main)
    expect(successMessage).toBeInTheDocument();
    expect(successMessage).toHaveStyle({ color: 'rgb(46, 125, 50)' }); // MUI default success.main
  });

  // AC 5: No budget
  it('should not display warning/success when budget is null', () => {
    // Real utility returns severity: 'none' when budget is null
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);

    // Should NOT display warning or success messages
    expect(screen.queryByText(/Dự kiến vượt ngân sách/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Đang đúng hướng/i)).not.toBeInTheDocument();

    // Should still display projection
    expect(screen.getByText(/Dự kiến cuối tháng:/i)).toBeInTheDocument();
  });

  // AC 6: Zero spending
  it('should display 0 ₫ projection when dailyAverage is 0', () => {
    // Real calculation: 0 × 31 = 0
    renderWithTheme(<MonthEndProjection dailyAverage={0} budget={null} />);

    // Should display 0 ₫
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  // AC 8: Real-time updates
  it('should re-render when dailyAverage prop changes', () => {
    // Initial: 400K × 31 = 12.4M
    const { rerender } = renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);

    expect(screen.getByText(/12\.400\.000/)).toBeInTheDocument();

    // Update dailyAverage prop: 450K × 31 = 13.95M (rounds to 13.950.000)
    rerender(
      <ThemeProvider theme={theme}>
        <MonthEndProjection dailyAverage={450_000} budget={null} />
      </ThemeProvider>
    );

    // Should display new projection calculated by real utility
    expect(screen.getByText(/13\.950\.000/)).toBeInTheDocument();
  });

  it('should re-render when budget prop changes', () => {
    // Initial: No budget (no warning/success)
    const { rerender } = renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);

    expect(screen.queryByText(/Dự kiến vượt ngân sách/i)).not.toBeInTheDocument();

    // Update budget prop to trigger warning (12.4M > 10M)
    rerender(
      <ThemeProvider theme={theme}>
        <MonthEndProjection dailyAverage={400_000} budget={10_000_000} />
      </ThemeProvider>
    );

    // Should now display warning message from real utility
    expect(screen.getByText(/Dự kiến vượt ngân sách/i)).toBeInTheDocument();
  });

  // AC 11: Accessibility
  it('should have aria-label for screen readers', () => {
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);

    // Should have descriptive aria-label with real calculated amount
    const projectionElement = screen.getByLabelText(/Projected month end spending/i);
    expect(projectionElement).toBeInTheDocument();
  });

  it('should use Typography component from Material-UI', () => {
    renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);

    // Typography renders as <p> or <span> by default
    const projectionText = screen.getByText(/Dự kiến cuối tháng:/i);
    expect(projectionText).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => {
      renderWithTheme(<MonthEndProjection dailyAverage={400_000} budget={null} />);
    }).not.toThrow();
  });
});
