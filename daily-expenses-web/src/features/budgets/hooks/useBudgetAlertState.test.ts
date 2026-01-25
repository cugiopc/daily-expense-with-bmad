import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBudgetAlertState } from './useBudgetAlertState';

describe('useBudgetAlertState', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('hasTriggered', () => {
    it('should return false initially when no state exists', () => {
      const { result } = renderHook(() =>
        useBudgetAlertState('budget-123')
      );

      const triggered = result.current.hasTriggered(80);

      expect(triggered).toBe(false);
    });

    it('should return false when budget ID is null', () => {
      const { result } = renderHook(() => useBudgetAlertState(null));

      const triggered = result.current.hasTriggered(80);

      expect(triggered).toBe(false);
    });

    it('should return true after marking as triggered', () => {
      const { result } = renderHook(() =>
        useBudgetAlertState('budget-123')
      );

      // Mark as triggered
      act(() => {
        result.current.markAsTriggered('budget-123', 80);
      });

      // Check if triggered
      const triggered = result.current.hasTriggered(80);

      expect(triggered).toBe(true);
    });

    it('should persist state to localStorage', () => {
      const { result } = renderHook(() =>
        useBudgetAlertState('budget-persist')
      );

      act(() => {
        result.current.markAsTriggered('budget-persist', 80);
      });

      // Verify localStorage
      const key = 'budgetAlert:budget-persist:80';
      const stored = localStorage.getItem(key);

      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.triggered).toBe(true);
    });

    it('should read state from localStorage on mount', () => {
      // Pre-populate localStorage
      const key = 'budgetAlert:budget-existing:80';
      localStorage.setItem(
        key,
        JSON.stringify({
          triggered: true,
          timestamp: '2026-01-25T10:00:00.000Z',
          threshold: 80,
        })
      );

      // Mount hook
      const { result } = renderHook(() =>
        useBudgetAlertState('budget-existing')
      );

      const triggered = result.current.hasTriggered(80);

      expect(triggered).toBe(true);
    });
  });

  describe('markAsTriggered', () => {
    it('should update alert state to triggered', () => {
      const { result } = renderHook(() =>
        useBudgetAlertState('budget-456')
      );

      // Initially not triggered
      expect(result.current.hasTriggered(80)).toBe(false);

      // Mark as triggered
      act(() => {
        result.current.markAsTriggered('budget-456', 80);
      });

      // Now triggered
      expect(result.current.hasTriggered(80)).toBe(true);
    });

    it('should save timestamp when marking as triggered', () => {
      const { result } = renderHook(() =>
        useBudgetAlertState('budget-timestamp')
      );

      const beforeTime = new Date().toISOString();

      act(() => {
        result.current.markAsTriggered('budget-timestamp', 80);
      });

      const afterTime = new Date().toISOString();

      const key = 'budgetAlert:budget-timestamp:80';
      const stored = localStorage.getItem(key);
      const parsed = JSON.parse(stored!);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.timestamp >= beforeTime).toBe(true);
      expect(parsed.timestamp <= afterTime).toBe(true);
    });
  });

  describe('multiple budgets', () => {
    it('should handle multiple budgets independently', () => {
      const { result: result1 } = renderHook(() =>
        useBudgetAlertState('budget-jan')
      );
      const { result: result2 } = renderHook(() =>
        useBudgetAlertState('budget-feb')
      );

      // Mark jan as triggered
      act(() => {
        result1.current.markAsTriggered('budget-jan', 80);
      });

      // Jan should be triggered, Feb should not
      expect(result1.current.hasTriggered(80)).toBe(true);
      expect(result2.current.hasTriggered(80)).toBe(false);
    });

    it('should support multiple thresholds per budget (80% and 100%)', () => {
      const { result } = renderHook(() =>
        useBudgetAlertState('budget-multi')
      );

      // Mark 80% as triggered
      act(() => {
        result.current.markAsTriggered('budget-multi', 80);
      });

      // 80% triggered, 100% not triggered
      expect(result.current.hasTriggered(80)).toBe(true);
      expect(result.current.hasTriggered(100)).toBe(false);

      // Mark 100% as triggered
      act(() => {
        result.current.markAsTriggered('budget-multi', 100);
      });

      // Both triggered
      expect(result.current.hasTriggered(80)).toBe(true);
      expect(result.current.hasTriggered(100)).toBe(true);
    });
  });

  describe('budget ID changes', () => {
    it('should return correct state when budget ID changes', () => {
      const { result, rerender } = renderHook(
        ({ budgetId }) => useBudgetAlertState(budgetId),
        { initialProps: { budgetId: 'budget-old' } }
      );

      // Mark old budget as triggered
      act(() => {
        result.current.markAsTriggered('budget-old', 80);
      });

      expect(result.current.hasTriggered(80)).toBe(true);

      // Change budget ID
      rerender({ budgetId: 'budget-new' });

      // New budget should not be triggered
      expect(result.current.hasTriggered(80)).toBe(false);
    });

    it('should handle null budget ID after having a valid ID', () => {
      const { result, rerender } = renderHook(
        ({ budgetId }) => useBudgetAlertState(budgetId),
        { initialProps: { budgetId: 'budget-valid' as string | null } }
      );

      // Mark as triggered
      act(() => {
        result.current.markAsTriggered('budget-valid', 80);
      });

      expect(result.current.hasTriggered(80)).toBe(true);

      // Change to null
      rerender({ budgetId: null });

      // Should return false for null budget
      expect(result.current.hasTriggered(80)).toBe(false);
    });
  });

  describe('memoization and stability', () => {
    it('should return stable functions across renders', () => {
      const { result, rerender } = renderHook(() =>
        useBudgetAlertState('budget-stable')
      );

      const firstHasTriggered = result.current.hasTriggered;
      const firstMarkAsTriggered = result.current.markAsTriggered;

      rerender();

      expect(result.current.hasTriggered).toBe(firstHasTriggered);
      expect(result.current.markAsTriggered).toBe(firstMarkAsTriggered);
    });
  });
});
