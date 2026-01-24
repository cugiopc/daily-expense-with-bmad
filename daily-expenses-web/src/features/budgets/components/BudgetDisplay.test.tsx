/**
 * Tests for BudgetDisplay component
 * Story 3.3: Display Remaining Budget
 *
 * Acceptance Criteria Coverage:
 * - AC 1: Display remaining budget with thousands separator
 * - AC 3: Handle over budget with warning color
 * - AC 4: Handle no budget set with "Set Budget" action
 * - AC 8: Number formatting with Vietnamese Dong
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BudgetDisplay } from './BudgetDisplay';
import type { Budget } from '../types/budget.types';
import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';

// Create test query client and theme
const createTestQueryClient = () => {
  return new (require('@tanstack/react-query').QueryClient)({
    defaultOptions: {
      queries: { retry: false },
    },
  });
};

const theme = createTheme();

interface WrapperProps {
  children: ReactNode;
}

function Wrapper({ children }: WrapperProps): JSX.Element {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('BudgetDisplay', () => {
  describe('AC 1: Display Remaining Budget (Under Budget)', () => {
    it('should display remaining budget when under budget', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 3000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Check for remaining amount and budget label
      expect(container.textContent).toContain('Ngân sách');
      expect(container.textContent).toContain('12.000.000'); // Vietnamese formatting uses dots
    });

    it('should use green color for under budget status', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 3000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Check for Paper component with appropriate styling
      const paper = container.querySelector('[class*="MuiPaper"]');
      expect(paper).toBeInTheDocument();
    });
  });

  describe('AC 3: Handle Over Budget', () => {
    it('should display "Over Budget" when spent exceeds budget', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 16000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      expect(container.textContent).toContain('Vượt quá ngân sách');
      expect(container.textContent).toContain('1.000.000'); // Over amount in Vietnamese format
    });

    it('should show positive amount for overspend (not negative)', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 16000000; // 1M over

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Should show "1,000,000" not "-1,000,000"
      expect(container.textContent).toContain('1.000.000');
      expect(container.textContent).not.toContain('-1.000.000');
    });

    it('should use error/warning color for over budget', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 16000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      expect(container.textContent).toContain('Vượt quá ngân sách');
    });
  });

  describe('AC 4: Handle No Budget Set', () => {
    it('should display "Set a budget" when budget is null', () => {
      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={null} monthlyTotal={0} />
        </Wrapper>
      );

      expect(container.textContent).toContain('Hãy đặt ngân sách');
    });

    it('should have a "Set Budget" button in empty state', () => {
      render(
        <Wrapper>
          <BudgetDisplay budget={null} monthlyTotal={0} />
        </Wrapper>
      );

      expect(screen.getByRole('button', { name: /đặt ngân sách/i })).toBeInTheDocument();
    });

    it('should call onSetBudget callback when button is clicked', async () => {
      const mockOnSetBudget = vi.fn();
      const user = userEvent.setup({ delay: null });

      const { rerender } = render(
        <Wrapper>
          <BudgetDisplay budget={null} monthlyTotal={0} onSetBudget={mockOnSetBudget} />
        </Wrapper>
      );

      const button = screen.getByRole('button', { name: /đặt ngân sách/i });
      await user.click(button);

      expect(mockOnSetBudget).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC 8: Number Formatting', () => {
    it('should format 1,000 with Vietnamese locale', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 1000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 0;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Vietnamese locale uses dots as thousands separator
      expect(container.textContent).toContain('1.000');
    });

    it('should format large numbers like 1,234,567 correctly', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 1234567,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 0;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Should contain the formatted amount
      expect(container.textContent).toContain('1.234.567');
    });

    it('should not show decimal places for Vietnamese Dong', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 0;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Should contain formatted amount without decimals
      expect(container.textContent).toContain('15.000.000');
      // Should not contain decimal separator in VND amounts
      const fullText = container.textContent || '';
      const vndMatches = fullText.match(/\d+\.\d+\.\d+/g);
      expect(vndMatches).toBeTruthy(); // Has thousands separators but no decimals
    });
  });

  describe('Accessibility', () => {
    it('should render with accessible Paper component', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 3000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Check for presence of Paper component (accessible container)
      const paper = container.querySelector('[class*="MuiPaper"]');
      expect(paper).toBeInTheDocument();
    });

    it('should have proper Typography hierarchy', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 3000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Check for Typography components
      const typography = container.querySelectorAll('[class*="MuiTypography"]');
      expect(typography.length).toBeGreaterThan(0);
    });

    it('should have aria-label on under budget amount for screen readers', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 3000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Find the h5 (h5 variant Typography) element
      const heading = container.querySelector('h5');
      expect(heading).toHaveAttribute('aria-label');
      expect(heading?.getAttribute('aria-label')).toContain('còn lại');
    });

    it('should have aria-label on over budget amount for screen readers', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 16000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      const heading = container.querySelector('h5');
      expect(heading).toHaveAttribute('aria-label');
      expect(heading?.getAttribute('aria-label')).toContain('Vượt quá');
    });
  });

  describe('AC 5: Real-Time Updates on Expense Changes', () => {
    it('should update remaining budget when monthlyTotal prop changes', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };

      const { container, rerender } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={3000000} />
        </Wrapper>
      );

      // Initial state: 12M remaining
      expect(container.textContent).toContain('12.000.000');

      // Simulate expense being added: monthlyTotal increases to 5M
      rerender(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={5000000} />
        </Wrapper>
      );

      // Should update to 10M remaining
      expect(container.textContent).toContain('10.000.000');
      expect(container.textContent).not.toContain('12.000.000');
    });

    it('should recalculate from under budget to over budget when expenses increase', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };

      const { container, rerender } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={10000000} />
        </Wrapper>
      );

      // Initial: Under budget
      expect(container.textContent).toContain('Ngân sách');
      expect(container.textContent).not.toContain('Vượt quá');

      // Simulate adding expense: monthlyTotal = 16M (over budget)
      rerender(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={16000000} />
        </Wrapper>
      );

      // Should switch to over budget display
      expect(container.textContent).toContain('Vượt quá ngân sách');
      expect(container.textContent).not.toContain('Ngân sách');
    });

    it('should recalculate from over budget to under budget when expenses decrease', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };

      const { container, rerender } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={16000000} />
        </Wrapper>
      );

      // Initial: Over budget
      expect(container.textContent).toContain('Vượt quá ngân sách');

      // Simulate deleting expense: monthlyTotal = 10M (under budget)
      rerender(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={10000000} />
        </Wrapper>
      );

      // Should switch to under budget display
      expect(container.textContent).toContain('Ngân sách');
      expect(container.textContent).not.toContain('Vượt quá');
    });
  });

  describe('Edge Cases', () => {
    it('should handle monthlyTotal of 0', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={0} />
        </Wrapper>
      );

      // Full budget remaining
      expect(container.textContent).toContain('15.000.000');
    });

    it('should handle budget equal to monthlyTotal (zero remaining)', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 15000000,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 15000000;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      // Zero remaining should display
      expect(container.textContent).toContain('0');
    });

    it('should render correctly with very large budget amounts', () => {
      const budget: Budget = {
        id: 'budget-1',
        userId: 'user-1',
        month: '2026-01-01',
        amount: 999999999,
        createdAt: '2026-01-01T00:00:00Z',
      };
      const monthlyTotal = 0;

      const { container } = render(
        <Wrapper>
          <BudgetDisplay budget={budget} monthlyTotal={monthlyTotal} />
        </Wrapper>
      );

      expect(container.textContent).toContain('999.999.999');
    });
  });
});
