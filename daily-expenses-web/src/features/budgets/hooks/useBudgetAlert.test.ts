import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBudgetAlert } from './useBudgetAlert';
import type { Budget } from '../types';

describe('useBudgetAlert', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockBudget: Budget = {
    id: 'budget-test',
    userId: 'user-1',
    amount: 15_000_000, // 15M VND
    month: '2026-01',
    createdAt: '2026-01-25T10:00:00.000Z',
  };

  describe('alert triggering (AC 1)', () => {
    it('should trigger alert when monthly total crosses 80% threshold', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 11_000_000, // 73.33%
          },
        }
      );

      expect(result.current.alertOpen).toBe(false);

      // Cross 80% threshold
      rerender({
        budget: mockBudget,
        monthlyTotal: 12_500_000, // 83.33%
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
      });
    });

    it('should not trigger when already above 80% (AC 9)', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 13_000_000, // 86.67% - already above
          },
        }
      );

      expect(result.current.alertOpen).toBe(false);

      // Stay above 80%
      rerender({
        budget: mockBudget,
        monthlyTotal: 14_000_000, // 93.33%
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(false);
      });
    });

    it('should not trigger if budget is null (AC 8)', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: null,
            monthlyTotal: 10_000_000,
          },
        }
      );

      expect(result.current.alertOpen).toBe(false);

      rerender({ budget: null, monthlyTotal: 15_000_000 });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(false);
      });
    });
  });

  describe('alert message (AC 2)', () => {
    it('should generate Vietnamese message with percentage and amounts', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 11_000_000,
          },
        }
      );

      // Cross threshold
      rerender({
        budget: mockBudget,
        monthlyTotal: 12_000_000, // Exactly 80%
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
      });

      // Check message contains Vietnamese text
      expect(result.current.alertMessage).toContain('Cảnh báo ngân sách');
      expect(result.current.alertMessage).toContain('80%');
      // Should show amounts in millions (M format)
      expect(result.current.alertMessage).toMatch(/12M.*15M/);
    });

    it('should calculate percentage dynamically (fixes MEDIUM-1)', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 11_000_000,
          },
        }
      );

      // Cross threshold at 85%
      rerender({
        budget: mockBudget,
        monthlyTotal: 12_750_000, // 85% of 15M
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
      });

      // Message should show actual percentage (85%), not hardcoded 80%
      expect(result.current.alertMessage).toContain('85%');
      expect(result.current.alertMessage).toContain('12.8M');
      expect(result.current.alertMessage).toContain('15M');
    });
  });

  describe('alert does not re-trigger (AC 6)', () => {
    it('should not re-trigger on subsequent expenses', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 11_000_000,
          },
        }
      );

      // Cross threshold - should trigger
      rerender({
        budget: mockBudget,
        monthlyTotal: 12_500_000,
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
      });

      // Close alert
      result.current.closeAlert();

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(false);
      });

      // Add another expense - should NOT re-trigger
      rerender({
        budget: mockBudget,
        monthlyTotal: 13_000_000,
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(false);
      });
    });
  });

  describe('alert state persistence (AC 7)', () => {
    it('should persist state across component remounts', async () => {
      // First mount - trigger alert
      const { result: result1, rerender: rerender1 } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 11_000_000,
          },
        }
      );

      rerender1({
        budget: mockBudget,
        monthlyTotal: 12_500_000,
      });

      await waitFor(() => {
        expect(result1.current.alertOpen).toBe(true);
      });

      // Unmount and remount
      const { result: result2 } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 12_500_000,
          },
        }
      );

      // Alert should NOT re-trigger (state persisted)
      await waitFor(() => {
        expect(result2.current.alertOpen).toBe(false);
      });
    });
  });

  describe('closeAlert function', () => {
    it('should close alert when closeAlert is called', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 11_000_000,
          },
        }
      );

      // Trigger alert
      rerender({
        budget: mockBudget,
        monthlyTotal: 12_500_000,
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
      });

      // Close alert
      result.current.closeAlert();

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(false);
      });
    });
  });

  describe('alert severity', () => {
    it('should return warning severity for 80% threshold', () => {
      const { result } = renderHook(() =>
        useBudgetAlert(mockBudget, 10_000_000)
      );

      expect(result.current.alertSeverity).toBe('warning');
    });
  });

  describe('multiple thresholds (80% and 100%) - Story 3.8', () => {
    it('should trigger 100% alert when exceeding budget', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 14_999_999, // 99.99%
          },
        }
      );

      expect(result.current.alertOpen).toBe(false);

      // Exceed budget
      rerender({
        budget: mockBudget,
        monthlyTotal: 15_500_000, // 103.33%
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
        expect(result.current.alertSeverity).toBe('error');
        expect(result.current.alertThreshold).toBe(100);
      });
    });

    it('should trigger both alerts sequentially when crossing both thresholds', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 10_000_000, // 66.67%
          },
        }
      );

      // Cross 80% threshold first
      rerender({
        budget: mockBudget,
        monthlyTotal: 12_500_000, // 83.33%
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
        expect(result.current.alertSeverity).toBe('warning');
        expect(result.current.alertThreshold).toBe(80);
      });

      // Close 80% alert
      result.current.closeAlert();

      // Cross 100% threshold
      rerender({
        budget: mockBudget,
        monthlyTotal: 15_500_000, // 103.33%
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
        expect(result.current.alertSeverity).toBe('error');
        expect(result.current.alertThreshold).toBe(100);
      });
    });

    it('should not re-trigger 100% alert when already over budget', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 14_999_999,
          },
        }
      );

      // Cross to 103%
      rerender({
        budget: mockBudget,
        monthlyTotal: 15_500_000,
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
      });

      // Close alert
      result.current.closeAlert();

      // Go further over budget
      rerender({
        budget: mockBudget,
        monthlyTotal: 16_000_000, // 106.67%
      });

      await waitFor(() => {
        // Should NOT re-trigger
        expect(result.current.alertOpen).toBe(false);
      });
    });

    it('should show over-budget message with excess amount', async () => {
      const { result, rerender } = renderHook(
        ({ budget, monthlyTotal }) => useBudgetAlert(budget, monthlyTotal),
        {
          initialProps: {
            budget: mockBudget,
            monthlyTotal: 14_500_000,
          },
        }
      );

      // Exceed by 500K
      rerender({
        budget: mockBudget,
        monthlyTotal: 15_500_000,
      });

      await waitFor(() => {
        expect(result.current.alertOpen).toBe(true);
        expect(result.current.alertMessage).toContain('Vượt quá ngân sách');
        expect(result.current.alertMessage).toContain('500,000đ');
      });
    });
  });
});
