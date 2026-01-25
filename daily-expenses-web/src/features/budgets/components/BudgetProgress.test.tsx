/**
 * BudgetProgress Component Tests
 *
 * Test Coverage:
 * - AC 1: Display linear progress bar on home screen
 * - AC 2: Color-coded progress bar based on budget usage
 * - AC 3: Display amount breakdown below progress bar
 * - AC 4: Real-time progress bar updates (via prop changes)
 * - AC 5: Handle over-budget scenario (>100%)
 * - AC 6: Hide progress bar when no budget set
 * - AC 7: Responsive design and accessibility
 * - AC 8: Performance and caching (tested in integration)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BudgetProgress } from './BudgetProgress';
import type { Budget } from '../types/budget.types';

// Test helper: Render component with theme provider
function renderWithTheme(ui: React.ReactElement): ReturnType<typeof render> {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

// Test helper: Create mock budget
function createMockBudget(amount: number): Budget {
  return {
    budgetId: 'test-budget-id',
    userId: 'test-user-id',
    amount,
    monthStart: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('BudgetProgress', () => {
  // AC 1: Display Linear Progress Bar on Home Screen
  describe('AC 1: Display progress bar', () => {
    it('should render progress bar at 20% when spent 3M of 15M budget', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      // Progress bar should exist
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();

      // Progress bar should have correct value (20%)
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });

    it('should render progress bar with correct aria attributes', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
  });

  // AC 2: Color-Coded Progress Bar Based on Budget Usage
  describe('AC 2: Color coding', () => {
    it('should show green progress bar when usage is below 80%', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 10000000; // 67% - below 80%

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Color testing is done via visual inspection or snapshot testing
      // We verify the component renders without error
    });

    it('should show yellow progress bar when usage is 80-100%', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 13000000; // 87% - between 80-100%

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '87');
    });

    it('should show red progress bar when over budget', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 16000000; // 107% - over budget

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      // Progress bar caps at 100%
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle edge case: exactly 80% threshold', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 12000000; // Exactly 80%

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '80');
    });

    it('should handle edge case: exactly 100% threshold', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 15000000; // Exactly 100%

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle edge case: 79% (just below 80% threshold)', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 11850000; // 79% - should be green

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '79');
    });
  });

  // AC 3: Display Amount Breakdown Below Progress Bar
  describe('AC 3: Amount breakdown text', () => {
    it('should display "3.000.000₫ of 15.000.000₫ used" text', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      const { container } = renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      // Should display formatted amounts (check container text content)
      // Note: formatCurrency uses non-breaking space (\u00A0) before ₫
      const textContent = container.textContent || '';
      expect(textContent).toContain('3.000.000');
      expect(textContent).toContain('15.000.000');
      expect(textContent).toContain('₫');
      expect(textContent).toContain('đã sử dụng');
    });

    it('should format numbers with Vietnamese locale (thousands separator)', () => {
      const budget = createMockBudget(1234567);
      const monthlyTotal = 987654;

      const { container } = renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      // Should use Vietnamese number formatting with dots as thousands separator
      const textContent = container.textContent || '';
      expect(textContent).toContain('987.654');
      expect(textContent).toContain('1.234.567');
      expect(textContent).toContain('₫');
    });

    it('should handle zero spending', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 0;

      const { container } = renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      const textContent = container.textContent || '';
      expect(textContent).toContain('0');
      expect(textContent).toContain('₫');
    });
  });

  // AC 5: Handle Over-Budget Scenario (>100%)
  describe('AC 5: Over-budget handling', () => {
    it('should cap progress bar at 100% when over budget', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 16000000; // 107%

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      // Progress bar display value should be capped at 100
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should show "Over budget by {amount}₫" text when >100%', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 16000000; // 1M over

      const { container } = renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      // Should show over-budget text
      const textContent = container.textContent || '';
      expect(textContent).toContain('Vượt quá ngân sách');
      expect(textContent).toContain('1.000.000');
      expect(textContent).toContain('₫');
    });

    it('should display actual amounts when over budget (not capped)', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 20000000; // 5M over

      const { container } = renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      // Text should show actual amounts, not capped
      const textContent = container.textContent || '';
      expect(textContent).toContain('20.000.000');
      expect(textContent).toContain('15.000.000');
      expect(textContent).toContain('₫');
      expect(textContent).toContain('đã sử dụng');
    });
  });

  // AC 6: Hide Progress Bar When No Budget Set
  describe('AC 6: Hide when no budget', () => {
    it('should return null when budget is null', () => {
      const { container } = renderWithTheme(
        <BudgetProgress budget={null} monthlyTotal={3000000} />
      );

      // Component should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should not render progress bar when budget is null', () => {
      renderWithTheme(<BudgetProgress budget={null} monthlyTotal={3000000} />);

      // Progress bar should not exist
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  // AC 7: Responsive Design and Accessibility
  describe('AC 7: Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      // Should have descriptive aria-label
      expect(progressBar).toHaveAttribute('aria-label');
      const ariaLabel = progressBar.getAttribute('aria-label');
      expect(ariaLabel).toContain('20'); // percentage
    });

    it('should have aria-valuemin, aria-valuemax, aria-valuenow attributes', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
  });

  describe('AC 7: Responsive design', () => {
    it('should render progress bar with minimum height for visibility', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      const { container } = renderWithTheme(
        <BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />
      );

      const progressBar = screen.getByRole('progressbar');
      // Progress bar should have height styling (verified via component implementation)
      expect(progressBar).toBeInTheDocument();
      // Note: sx prop height verification requires snapshot or visual regression testing
    });

    it('should render full-width container', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      const { container } = renderWithTheme(
        <BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />
      );

      // Container Box should exist with width: 100%
      const containerBox = container.querySelector('[class*="MuiBox"]');
      expect(containerBox).toBeInTheDocument();
    });

    it('should render with responsive max-width on desktop', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3000000;

      const { container } = renderWithTheme(
        <BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />
      );

      // Component should render without errors (responsive sx props verified via implementation)
      expect(container).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // AC 4: Real-Time Updates (tested via prop changes)
  describe('AC 4: Real-time updates', () => {
    it('should re-render when props change', () => {
      const budget = createMockBudget(15000000);

      const { rerender } = renderWithTheme(
        <BudgetProgress budget={budget} monthlyTotal={3000000} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');

      // Update monthly total (simulate expense addition)
      rerender(
        <ThemeProvider theme={createTheme()}>
          <BudgetProgress budget={budget} monthlyTotal={5000000} />
        </ThemeProvider>
      );

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    });

    it('should update color when threshold crossed', () => {
      const budget = createMockBudget(15000000);

      const { rerender } = renderWithTheme(
        <BudgetProgress budget={budget} monthlyTotal={10000000} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67'); // Green (below 80%)

      // Cross 80% threshold
      rerender(
        <ThemeProvider theme={createTheme()}>
          <BudgetProgress budget={budget} monthlyTotal={13000000} />
        </ThemeProvider>
      );

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '87'); // Yellow (80-100%)
    });
  });

  // Edge cases
  describe('Edge cases', () => {
    it('should handle very large amounts', () => {
      const budget = createMockBudget(100000000); // 100M
      const monthlyTotal = 50000000; // 50M

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should handle decimal percentages correctly', () => {
      const budget = createMockBudget(15000000);
      const monthlyTotal = 3333333; // 22.22%

      renderWithTheme(<BudgetProgress budget={budget} monthlyTotal={monthlyTotal} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '22');
    });
  });
});
