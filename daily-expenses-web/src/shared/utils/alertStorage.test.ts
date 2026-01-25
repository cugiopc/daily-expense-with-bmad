import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveAlertState,
  getAlertState,
  clearAlertState,
} from './alertStorage';

describe('alertStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveAlertState', () => {
    it('should save alert state to localStorage with correct key format', () => {
      const budgetId = 'budget-123';
      const threshold = 80;
      const triggered = true;

      saveAlertState(budgetId, threshold, triggered);

      const key = `budgetAlert:${budgetId}:${threshold}`;
      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.triggered).toBe(true);
      expect(parsed.threshold).toBe(80);
      expect(parsed.timestamp).toBeDefined();
    });

    it('should save triggered=false when alert not triggered', () => {
      const budgetId = 'budget-456';
      const threshold = 80;
      const triggered = false;

      saveAlertState(budgetId, threshold, triggered);

      const key = `budgetAlert:${budgetId}:${threshold}`;
      const stored = localStorage.getItem(key);
      const parsed = JSON.parse(stored!);

      expect(parsed.triggered).toBe(false);
    });

    it('should handle localStorage quota exceeded error gracefully', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw error
      expect(() => {
        saveAlertState('budget-789', 80, true);
      }).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should include ISO 8601 timestamp in saved state', () => {
      saveAlertState('budget-abc', 80, true);

      const key = 'budgetAlert:budget-abc:80';
      const stored = localStorage.getItem(key);
      const parsed = JSON.parse(stored!);

      // Verify timestamp is ISO 8601 format
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });
  });

  describe('getAlertState', () => {
    it('should return triggered=false when no state exists', () => {
      const state = getAlertState('budget-nonexistent', 80);

      expect(state.triggered).toBe(false);
      expect(state.timestamp).toBeNull();
    });

    it('should return saved alert state when exists', () => {
      const budgetId = 'budget-123';
      const threshold = 80;

      // Save first
      saveAlertState(budgetId, threshold, true);

      // Then retrieve
      const state = getAlertState(budgetId, threshold);

      expect(state.triggered).toBe(true);
      expect(state.timestamp).not.toBeNull();
      expect(state.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      const key = 'budgetAlert:budget-corrupted:80';
      localStorage.setItem(key, 'invalid-json{{{');

      // Should return default state instead of throwing
      const state = getAlertState('budget-corrupted', 80);

      expect(state.triggered).toBe(false);
      expect(state.timestamp).toBeNull();
    });

    it('should handle missing triggered field in stored data', () => {
      const key = 'budgetAlert:budget-incomplete:80';
      localStorage.setItem(key, JSON.stringify({ timestamp: '2026-01-25T10:00:00.000Z' }));

      const state = getAlertState('budget-incomplete', 80);

      expect(state.triggered).toBe(false);
    });
  });

  describe('clearAlertState', () => {
    it('should remove alert state for specific budget', () => {
      const budgetId = 'budget-123';

      // Save multiple thresholds
      saveAlertState(budgetId, 80, true);
      saveAlertState(budgetId, 100, true);

      // Clear this budget
      clearAlertState(budgetId);

      // Verify removed
      expect(localStorage.getItem(`budgetAlert:${budgetId}:80`)).toBeNull();
      expect(localStorage.getItem(`budgetAlert:${budgetId}:100`)).toBeNull();
    });

    it('should not affect other budgets when clearing', () => {
      saveAlertState('budget-keep', 80, true);
      saveAlertState('budget-remove', 80, true);

      clearAlertState('budget-remove');

      // budget-keep should still exist
      const keepState = getAlertState('budget-keep', 80);
      expect(keepState.triggered).toBe(true);

      // budget-remove should be gone
      const removeState = getAlertState('budget-remove', 80);
      expect(removeState.triggered).toBe(false);
    });

    it('should handle clearing non-existent budget without error', () => {
      expect(() => {
        clearAlertState('budget-nonexistent');
      }).not.toThrow();
    });
  });

  describe('multiple budgets and thresholds', () => {
    it('should support multiple thresholds per budget (80% and 100%)', () => {
      const budgetId = 'budget-multi';

      saveAlertState(budgetId, 80, true);
      saveAlertState(budgetId, 100, false);

      const state80 = getAlertState(budgetId, 80);
      const state100 = getAlertState(budgetId, 100);

      expect(state80.triggered).toBe(true);
      expect(state100.triggered).toBe(false);
    });

    it('should keep alert states independent across different budgets', () => {
      saveAlertState('budget-jan', 80, true);
      saveAlertState('budget-feb', 80, false);

      const janState = getAlertState('budget-jan', 80);
      const febState = getAlertState('budget-feb', 80);

      expect(janState.triggered).toBe(true);
      expect(febState.triggered).toBe(false);
    });
  });
});
