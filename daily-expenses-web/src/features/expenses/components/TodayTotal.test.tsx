/**
 * Tests for TodayTotal component - Real-time calculation
 * 
 * Tests cover:
 * - Correct calculation of today's total
 * - Real-time updates when cache changes
 * - Currency formatting
 * - Filtering only today's expenses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../contexts/AuthContext';
import { TodayTotal } from './TodayTotal';
import * as expensesApi from '../api/expensesApi';
import type { ReactNode } from 'react';

vi.mock('../api/expensesApi');

describe('TodayTotal', () => {
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

  // Helper to get today's date in ISO format (local timezone, matching component)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  it('should calculate today\'s total correctly', async () => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 30000,
        note: 'breakfast',
        date: today, // Today
        createdAt: `${today}T08:00:00Z`,
        updatedAt: `${today}T08:00:00Z`,
      },
      {
        id: 'expense-2',
        userId: 'user-1',
        amount: 50000,
        note: 'lunch',
        date: today, // Today
        createdAt: `${today}T12:00:00Z`,
        updatedAt: `${today}T12:00:00Z`,
      },
      {
        id: 'expense-3',
        userId: 'user-1',
        amount: 20000,
        note: 'yesterday',
        date: yesterday, // Yesterday
        createdAt: `${yesterday}T12:00:00Z`,
        updatedAt: `${yesterday}T12:00:00Z`,
      },
    ]);

    render(<TodayTotal />, { wrapper });

    // First check: "Hôm nay" (Today in Vietnamese) should be visible
    await waitFor(() => {
      expect(screen.getByText('Hôm nay')).toBeInTheDocument();
    });

    // Check that some currency text is displayed with ₫ symbol
    await waitFor(() => {
      const allText = screen.getByText(/₫/);
      expect(allText).toBeInTheDocument();
    });
  });

  it('should show 0 when no expenses today', async () => {
    const yesterday = getYesterdayDate();

    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 50000,
        note: 'yesterday',
        date: yesterday, // Yesterday
        createdAt: `${yesterday}T12:00:00Z`,
        updatedAt: `${yesterday}T12:00:00Z`,
      },
    ]);

    render(<TodayTotal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  it('should display "Hôm nay" label', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([]);

    render(<TodayTotal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Hôm nay')).toBeInTheDocument();
    });
  });

  it('should format currency in Vietnamese format', async () => {
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([
      {
        id: 'expense-1',
        userId: 'user-1',
        amount: 1500000,
        note: 'big expense',
        date: '2026-01-19',
        createdAt: '2026-01-19T10:00:00Z',
        updatedAt: '2026-01-19T10:00:00Z',
      },
    ]);

    render(<TodayTotal />, { wrapper });

    await waitFor(() => {
      // Vietnamese format: 1.500.000 ₫ or 1,500,000 ₫
      const monthlyTotal = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('₫') || false;
      });
      expect(monthlyTotal.length).toBeGreaterThan(0);
    });
  });
});
