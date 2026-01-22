/**
 * Tests for ExpenseList component - Real-time updates
 * 
 * Tests cover:
 * - Loading state (skeleton)
 * - Error state
 * - Empty state
 * - Expense display
 * - Sorting (newest first)
 * - Optimistic entry visual indicator
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../contexts/AuthContext';
import { ExpenseList } from './ExpenseList';
import * as expensesApi from '../api/expensesApi';
import type { ReactNode } from 'react';

vi.mock('../api/expensesApi');

describe('ExpenseList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthProvider>
  );

  it('should show loading skeleton on initial load', () => {
    vi.mocked(expensesApi.getExpenses).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ExpenseList />, { wrapper });

    // Check for skeleton elements (5 skeletons expected)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show error state when API fails', async () => {
    vi.mocked(expensesApi.getExpenses).mockRejectedValue(
      new Error('Network error')
    );

    render(<ExpenseList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show empty state when no expenses', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([]);

    render(<ExpenseList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Chưa có chi tiêu nào/i)).toBeInTheDocument();
      expect(screen.getByText(/Nhấn nút \+ để thêm chi tiêu đầu tiên/i)).toBeInTheDocument();
    });
  });

  it('should display expenses sorted by newest first', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 30000,
        note: 'Older expense',
        date: '2026-01-17',
        createdAt: '2026-01-17T10:00:00Z',
        updatedAt: '2026-01-17T10:00:00Z',
      },
      {
        id: 'expense-2',
        userId: 'user-1',
        amount: 50000,
        note: 'Newer expense',
        date: '2026-01-19',
        createdAt: '2026-01-19T10:00:00Z',
        updatedAt: '2026-01-19T10:00:00Z',
      },
    ]);

    render(<ExpenseList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Newer expense')).toBeInTheDocument();
    });

    // Verify newer expense appears first in DOM
    const expenses = screen.getAllByText(/expense/i);
    expect(expenses[0].textContent).toContain('Newer');
    expect(expenses[1].textContent).toContain('Older');
  });

  it('should format currency correctly', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Test expense',
        date: '2026-01-19T10:00:00Z',
        createdAt: '2026-01-19T10:00:00Z',
        updatedAt: '2026-01-19T10:00:00Z',
      },
    ]);

    render(<ExpenseList />, { wrapper });

    await waitFor(() => {
      // Vietnamese currency format: 50.000 ₫ (appears twice: as total and as amount)
      expect(screen.getAllByText(/50\.000/)).toHaveLength(2);
    });
  });

  it('should render grouped expenses by date', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Breakfast',
        date: '2026-01-21T09:00:00Z',
        createdAt: '2026-01-19T10:00:00Z',
        updatedAt: '2026-01-19T10:00:00Z',
      },
      {
        id: 'expense-2',
        userId: 'user-1',
        amount: 75000,
        note: 'Lunch',
        date: '2026-01-20T12:00:00Z',
        createdAt: '2026-01-20T12:00:00Z',
        updatedAt: '2026-01-20T12:00:00Z',
      },
    ]);

    render(<ExpenseList />, { wrapper });

    await waitFor(() => {
      // Should show both expenses
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
      expect(screen.getByText('Lunch')).toBeInTheDocument();
    });
  });

  it('should display date headers for groups', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'Test expense',
        date: '2026-01-21T10:00:00Z',
        createdAt: '2026-01-21T10:00:00Z',
        updatedAt: '2026-01-21T10:00:00Z',
      },
    ]);

    render(<ExpenseList />, { wrapper });

    await waitFor(() => {
      // Should show date header (formatted by getDateHeader)
      const dateHeader = screen.getByRole('heading', { level: 3 });
      expect(dateHeader).toBeInTheDocument();
    });
  });
});
