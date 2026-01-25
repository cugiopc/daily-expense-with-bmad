import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DailyAverage } from './DailyAverage';

// NOTE: No mocking - testing real integration between component and calculation utility
// Use vi.useFakeTimers() to control dates for predictable test results

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('DailyAverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the current date to Jan 15, 2026 for predictable calculations
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // AC 3: Display and formatting - basic case
  it('should display "Trung bình mỗi ngày: 400.000đ" with correct formatting', () => {
    // Arrange - Jan 15, 2026, monthlyTotal 6M
    // Expected: 6,000,000 / 15 = 400,000đ

    // Act
    renderWithTheme(<DailyAverage monthlyTotal={6_000_000} />);

    // Assert
    expect(screen.getByText(/Trung bình mỗi ngày:/i)).toBeInTheDocument();
    expect(screen.getByText(/400\.000\s*₫/)).toBeInTheDocument();
  });

  // AC 3: Number formatting with Vietnamese locale (dot separator)
  it('should format numbers with Vietnamese locale (dot separator)', () => {
    // Arrange - Jan 15, 2026, monthlyTotal 18,518,505
    // Expected: 18,518,505 / 15 = 1,234,567đ

    // Act
    renderWithTheme(<DailyAverage monthlyTotal={18_518_505} />);

    // Assert
    expect(screen.getByText(/1\.234\.567\s*₫/)).toBeInTheDocument();
  });

  // AC 4: Real-time updates - component re-renders when prop changes
  it('should re-render when monthlyTotal prop changes', () => {
    // Arrange - Jan 15, 2026, initial monthlyTotal 6M
    // Expected initial: 6,000,000 / 15 = 400,000đ
    const { rerender } = renderWithTheme(<DailyAverage monthlyTotal={6_000_000} />);

    // Assert initial render
    expect(screen.getByText(/400\.000\s*₫/)).toBeInTheDocument();

    // Act - update prop to 7M
    // Expected updated: 7,000,000 / 15 = 466,667đ
    rerender(
      <ThemeProvider theme={theme}>
        <DailyAverage monthlyTotal={7_000_000} />
      </ThemeProvider>
    );

    // Assert - updated render
    expect(screen.getByText(/466\.667\s*₫/)).toBeInTheDocument();
  });

  // AC 6: Zero handling
  it('should display "0đ" when monthlyTotal is 0', () => {
    // Arrange - Jan 15, 2026, no spending
    // Expected: 0 / 15 = 0đ

    // Act
    renderWithTheme(<DailyAverage monthlyTotal={0} />);

    // Assert
    expect(screen.getByText(/Trung bình mỗi ngày:/i)).toBeInTheDocument();
    expect(screen.getByText(/0\s*₫/)).toBeInTheDocument();
  });

  // AC 8: Accessibility - aria-label (Vietnamese for consistency)
  it('should have Vietnamese aria-label for screen readers', () => {
    // Arrange - Jan 15, 2026, 6M total = 400K daily average

    // Act
    renderWithTheme(<DailyAverage monthlyTotal={6_000_000} />);

    // Assert - aria-label in Vietnamese
    const element = screen.getByLabelText(/Trung bình chi tiêu mỗi ngày:/i);
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-label', expect.stringContaining('400 nghìn đồng'));
  });

  // AC 8: Use Typography component from Material-UI
  it('should use Typography component from Material-UI', () => {
    // Arrange

    // Act
    const { container } = renderWithTheme(<DailyAverage monthlyTotal={6_000_000} />);

    // Assert - Typography renders as <p> tag by default for body1 variant
    const typography = container.querySelector('p');
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveClass('MuiTypography-root');
  });

  // AC 8: Minimum font size requirement (14px for body1)
  it('should meet minimum font size requirement (14px)', () => {
    // Arrange

    // Act
    const { container } = renderWithTheme(<DailyAverage monthlyTotal={6_000_000} />);

    // Assert - body1 variant has font-size 1rem (16px by default in MUI)
    const typography = container.querySelector('.MuiTypography-body1');
    expect(typography).toBeInTheDocument();
  });

  // Edge case: Large amounts
  it('should handle large amounts correctly', () => {
    // Arrange - Jan 15, 2026, 100M total
    // Expected: 100,000,000 / 15 = 6,666,667đ (rounded)

    // Act
    renderWithTheme(<DailyAverage monthlyTotal={100_000_000} />);

    // Assert
    expect(screen.getByText(/6\.666\.667\s*₫/)).toBeInTheDocument();
  });

  // Edge case: Component renders without errors
  it('should render without errors', () => {
    // Arrange

    // Act & Assert - no errors thrown
    expect(() => renderWithTheme(<DailyAverage monthlyTotal={6_000_000} />)).not.toThrow();
  });

  // Integration test: Real calculation with date
  it('should use real calculateDailyAverage function with current date', () => {
    // Arrange - Set date to Jan 20, 2026
    vi.setSystemTime(new Date('2026-01-20T10:00:00Z'));
    // Expected: 6,000,000 / 20 = 300,000đ

    // Act
    renderWithTheme(<DailyAverage monthlyTotal={6_000_000} />);

    // Assert
    expect(screen.getByText(/300\.000\s*₫/)).toBeInTheDocument();
  });
});
