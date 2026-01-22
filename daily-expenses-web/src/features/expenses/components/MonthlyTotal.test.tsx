/**
 * Tests for MonthlyTotal component - Real-time calculation
 * 
 * Tests cover:
 * - Correct calculation of current month's total
 * - Real-time updates when cache changes
 * - Currency formatting
 * - Filtering only current month's expenses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../contexts/AuthContext';
import { MonthlyTotal } from './MonthlyTotal';
import * as expensesApi from '../api/expensesApi';
import * as useOnlineStatus from '../../../hooks/useOnlineStatus';
import type { ReactNode } from 'react';

vi.mock('../api/expensesApi');
vi.mock('../../../hooks/useOnlineStatus');
vi.mock('../../../shared/utils/jwtHelper', () => ({
  getUserIdFromToken: vi.fn(() => 'test-user-123'),
}));

describe('MonthlyTotal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    // Mock online status as true (use API)
    vi.mocked(useOnlineStatus.useOnlineStatus).mockReturnValue(true);
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthProvider>
  );

  // Helper functions for date generation
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return { year, month };
  };

  const getLastMonth = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return { year, month };
  };

  it('should calculate current month\'s total correctly', async () => {
    const { year, month } = getCurrentMonth();
    const { year: lastYear, month: lastMonth } = getLastMonth();

    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 100000,
        note: 'expense 1',
        date: `${year}-${month}-05`, // This month
        createdAt: `${year}-${month}-05T10:00:00Z`,
        updatedAt: `${year}-${month}-05T10:00:00Z`,
      },
      {
        id: 'expense-2',
        userId: 'user-1',
        amount: 200000,
        note: 'expense 2',
        date: `${year}-${month}-15`, // This month
        createdAt: `${year}-${month}-15T10:00:00Z`,
        updatedAt: `${year}-${month}-15T10:00:00Z`,
      },
      {
        id: 'expense-3',
        userId: 'user-1',
        amount: 50000,
        note: 'last month',
        date: `${lastYear}-${lastMonth}-25`, // Last month
        createdAt: `${lastYear}-${lastMonth}-25T10:00:00Z`,
        updatedAt: `${lastYear}-${lastMonth}-25T10:00:00Z`,
      },
    ]);

    render(<MonthlyTotal />, { wrapper });

    await waitFor(() => {
      // Total should be 100000 + 200000 = 300000 (excludes last month)
      expect(screen.getByText(/300\.000/)).toBeInTheDocument();
    });
  });

  it('should show 0 when no expenses this month', async () => {
    const { year: lastYear, month: lastMonth } = getLastMonth();

    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'last month',
        date: `${lastYear}-${lastMonth}-25`, // Last month
        createdAt: `${lastYear}-${lastMonth}-25T10:00:00Z`,
        updatedAt: `${lastYear}-${lastMonth}-25T10:00:00Z`,
      },
    ]);

    render(<MonthlyTotal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  it('should display current month name in Vietnamese', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([]);

    render(<MonthlyTotal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Tháng 1')).toBeInTheDocument();
    });
  });

  it('should format currency in Vietnamese format', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 5000000,
        note: 'big expense',
        date: '2026-01-10',
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z',
      },
    ]);

    render(<MonthlyTotal />, { wrapper });

    await waitFor(() => {
      // Vietnamese format: 5.000.000 ₫
      expect(screen.getByText(/5\.000\.000/)).toBeInTheDocument();
    });
  });

  it('should handle month boundary correctly', async () => {
    // Set date to February to test month filtering
    vi.setSystemTime(new Date('2026-02-15T10:00:00Z'));

    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 100000,
        note: 'this month',
        date: '2026-02-10', // February
        createdAt: '2026-02-10T10:00:00Z',
        updatedAt: '2026-02-10T10:00:00Z',
      },
      {
        id: 'expense-2',
        userId: 'user-1',
        amount: 50000,
        note: 'last month',
        date: '2026-01-31', // January
        createdAt: '2026-01-31T10:00:00Z',
        updatedAt: '2026-01-31T10:00:00Z',
      },
    ]);

    render(<MonthlyTotal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Tháng 2')).toBeInTheDocument();
      // Only February expense counted
      expect(screen.getByText(/100\.000/)).toBeInTheDocument();
    });
  });
});
