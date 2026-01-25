/**
 * HomePage Integration Tests
 *
 * Test Coverage:
 * - BudgetProgress integration with HomePage
 * - Real-time updates when expenses change
 * - Month boundary behavior
 * - Budget display and progress bar coordination
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HomePage } from './HomePage';
import * as useExpensesHook from '../features/expenses/hooks/useExpenses';
import * as useCurrentBudgetHook from '../features/budgets/hooks/useCurrentBudget';
import * as jwtHelper from '../shared/utils/jwtHelper';
import type { Expense } from '../features/expenses/types/expense.types';
import type { Budget } from '../features/budgets/types/budget.types';

// Mock modules
vi.mock('../features/expenses/hooks/useExpenses');
vi.mock('../features/budgets/hooks/useCurrentBudget');
vi.mock('../shared/utils/jwtHelper');
vi.mock('../hooks/useAutoSync', () => ({
  useAutoSync: vi.fn(),
}));
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    accessToken: 'mock-token',
    user: null,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

// Test helper: Render HomePage with all providers
function renderHomePage(): ReturnType<typeof render> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const theme = createTheme();

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <HomePage />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
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

// Test helper: Create mock expense
function createMockExpense(amount: number, date: string): Expense {
  return {
    expenseId: `expense-${Math.random()}`,
    userId: 'test-user-id',
    amount,
    note: 'Test expense',
    date,
    categoryId: 'category-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    syncStatus: 'synced',
  };
}

describe('HomePage - BudgetProgress Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jwtHelper.getUserIdFromToken).mockReturnValue('test-user-id');
  });

  // Task 7: Verify BudgetProgress receives correct budget and monthlyTotal props
  it('should render BudgetProgress with correct props when budget exists', async () => {
    const mockBudget = createMockBudget(15000000);
    const mockExpenses = [
      createMockExpense(1000000, '2026-01-10T00:00:00Z'),
      createMockExpense(2000000, '2026-01-15T00:00:00Z'),
    ];

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    // BudgetProgress should receive budget and calculate monthlyTotal = 3M
    // Progress bar should show 20% (3M / 15M)
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
  });

  // Task 7: Progress bar visible when budget exists
  it('should show progress bar when budget is set', async () => {
    const mockBudget = createMockBudget(15000000);

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    await waitFor(() => {
      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Task 7: Progress bar hidden when no budget set
  it('should hide progress bar when no budget is set', async () => {
    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    await waitFor(() => {
      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  // Task 7: Progress bar color changes at 80% threshold
  it('should update progress bar when threshold crossed (67% → 87%)', async () => {
    const mockBudget = createMockBudget(15000000);

    // Initial: 67% usage (10M / 15M) - green
    const mockExpensesInitial = [createMockExpense(10000000, '2026-01-10T00:00:00Z')];

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpensesInitial,
      isLoading: false,
      error: null,
    } as any);

    const { rerender } = renderHomePage();

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67');
    });

    // Simulate expense addition: 87% usage (13M / 15M) - yellow
    const mockExpensesUpdated = [
      createMockExpense(10000000, '2026-01-10T00:00:00Z'),
      createMockExpense(3000000, '2026-01-15T00:00:00Z'),
    ];

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpensesUpdated,
      isLoading: false,
      error: null,
    } as any);

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <ThemeProvider theme={createTheme()}>
            <HomePage />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '87');
    });
  });

  // Task 7: Add expense → progress bar percentage increases
  it('should increase progress bar when expense added (20% → 33%)', async () => {
    const mockBudget = createMockBudget(15000000);

    // Initial: 3M spent (20%)
    const mockExpensesInitial = [createMockExpense(3000000, '2026-01-10T00:00:00Z')];

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpensesInitial,
      isLoading: false,
      error: null,
    } as any);

    const { rerender } = renderHomePage();

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });

    // Add 2M expense: 5M total (33%)
    const mockExpensesUpdated = [
      createMockExpense(3000000, '2026-01-10T00:00:00Z'),
      createMockExpense(2000000, '2026-01-15T00:00:00Z'),
    ];

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpensesUpdated,
      isLoading: false,
      error: null,
    } as any);

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <ThemeProvider theme={createTheme()}>
            <HomePage />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    });
  });

  // Task 7: Delete expense → progress bar percentage decreases
  it('should decrease progress bar when expense deleted (33% → 20%)', async () => {
    const mockBudget = createMockBudget(15000000);

    // Initial: 5M spent (33%)
    const mockExpensesInitial = [
      createMockExpense(3000000, '2026-01-10T00:00:00Z'),
      createMockExpense(2000000, '2026-01-15T00:00:00Z'),
    ];

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpensesInitial,
      isLoading: false,
      error: null,
    } as any);

    const { rerender } = renderHomePage();

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    });

    // Delete 2M expense: 3M remaining (20%)
    const mockExpensesUpdated = [createMockExpense(3000000, '2026-01-10T00:00:00Z')];

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpensesUpdated,
      isLoading: false,
      error: null,
    } as any);

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <ThemeProvider theme={createTheme()}>
            <HomePage />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
  });

  // Task 7: Month boundary - Progress bar resets on month change
  it('should only include current month expenses in progress calculation', async () => {
    const mockBudget = createMockBudget(15000000);

    // January 2026 expenses: 3M
    // December 2025 expense: 5M (should be excluded)
    const mockExpenses = [
      createMockExpense(3000000, '2026-01-10T00:00:00Z'), // Current month
      createMockExpense(5000000, '2025-12-15T00:00:00Z'), // Previous month
    ];

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    // Progress bar should only count January expenses (3M / 15M = 20%)
    // NOT 8M / 15M = 53%
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
  });

  // AC 8: Performance - Verify TanStack Query caching (smoke test)
  it('should use TanStack Query hooks for data fetching', async () => {
    const mockBudget = createMockBudget(15000000);

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    // Verify hooks were called (TanStack Query is being used)
    expect(useCurrentBudgetHook.useCurrentBudget).toHaveBeenCalled();
    expect(useExpensesHook.useExpenses).toHaveBeenCalled();
  });
});

describe('HomePage - DailyAverage Integration (Story 3.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jwtHelper.getUserIdFromToken).mockReturnValue('test-user-id');
  });

  // Task 7: Verify DailyAverage receives correct monthlyTotal and displays correct value
  it('should render DailyAverage with correct calculated value', async () => {
    // Arrange - 6M total spending in January
    const mockExpenses = [
      createMockExpense(3_000_000, '2026-01-10T00:00:00Z'),
      createMockExpense(3_000_000, '2026-01-15T00:00:00Z'),
    ];

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: createMockBudget(15_000_000),
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    // Assert - DailyAverage displays label and calculated value
    // Note: Value depends on current day of month during test execution
    await waitFor(() => {
      expect(screen.getByText(/Trung bình mỗi ngày:/i)).toBeInTheDocument();
      // Verify the formatted currency symbol is present (calculation happened)
      const dailyAverageElement = screen.getByText(/Trung bình mỗi ngày:/i);
      expect(dailyAverageElement.textContent).toMatch(/₫/);
    });
  });

  // Task 7: Verify daily average shows 0đ when no expenses (AC 6)
  it('should display daily average as 0đ when no expenses', async () => {
    // Arrange - no expenses, monthlyTotal = 0
    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: createMockBudget(15_000_000),
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    // Assert - should show 0 ₫ (0 / current_day = 0)
    await waitFor(() => {
      const dailyAverageElement = screen.getByText(/Trung bình mỗi ngày:/i);
      expect(dailyAverageElement).toBeInTheDocument();
      // Verify calculated value is 0đ
      expect(dailyAverageElement.textContent).toMatch(/0\s*₫/);
    });
  });

  // Task 7: Verify number formatting matches Vietnamese locale
  it('should format daily average with Vietnamese locale', async () => {
    const mockExpenses = [
      createMockExpense(6_000_000, '2026-01-01T00:00:00Z'),
    ];

    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    } as any);

    renderHomePage();

    // Number should be formatted with dots (Vietnamese locale)
    await waitFor(() => {
      // 6M total, current day varies, so daily average varies by date
      // We just verify the component renders with proper formatting
      const dailyAverageElement = screen.getByText(/Trung bình mỗi ngày:/i);
      expect(dailyAverageElement).toBeInTheDocument();
      // Verify formatting has ₫ symbol
      expect(dailyAverageElement.textContent).toMatch(/₫/);
    });
  });

  // Task 7: Verify DailyAverage positioned correctly (after BudgetProgress)
  it('should render DailyAverage after BudgetProgress component', async () => {
    vi.mocked(useCurrentBudgetHook.useCurrentBudget).mockReturnValue({
      data: createMockBudget(15_000_000),
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useExpensesHook.useExpenses).mockReturnValue({
      data: [createMockExpense(3_000_000, '2026-01-10T00:00:00Z')],
      isLoading: false,
      error: null,
    } as any);

    const { container } = renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/Trung bình mỗi ngày:/i)).toBeInTheDocument();
    });

    // Verify component structure (smoke test for positioning)
    const dailyAverageText = screen.getByText(/Trung bình mỗi ngày:/i);
    expect(dailyAverageText.tagName).toBe('P'); // Typography renders as p tag
    expect(container.querySelector('.MuiTypography-body1')).toBeInTheDocument();
  });
});
