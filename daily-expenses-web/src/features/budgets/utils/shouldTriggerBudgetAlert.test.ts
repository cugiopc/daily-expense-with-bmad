import { describe, it, expect } from 'vitest';
import { shouldTriggerBudgetAlert } from './shouldTriggerBudgetAlert';

describe('shouldTriggerBudgetAlert', () => {
  const budget = 15_000_000; // 15M VND
  const threshold = 80;

  describe('crossing threshold from below (AC 1, 6)', () => {
    it('should return true when crossing 80% threshold from 79% to 81%', () => {
      const previousTotal = 11_000_000; // 73.33%
      const newTotal = 12_500_000; // 83.33%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(true);
    });

    it('should return true when reaching exactly 80% from below', () => {
      const previousTotal = 11_999_999; // 79.999%
      const newTotal = 12_000_000; // 80.000%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(true);
    });

    it('should return true when jumping from 70% to 95% (large jump)', () => {
      const previousTotal = 10_500_000; // 70%
      const newTotal = 14_250_000; // 95%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(true);
    });

    it('should return true when previous total is 0 and new total exceeds threshold', () => {
      const previousTotal = 0; // 0%
      const newTotal = 13_000_000; // 86.67%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(true);
    });
  });

  describe('already above threshold (AC 9)', () => {
    it('should return false when already above 80% (85% → 90%)', () => {
      const previousTotal = 13_000_000; // 86.67%
      const newTotal = 14_000_000; // 93.33%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(false);
    });

    it('should return false when already exactly at 80% (80% → 85%)', () => {
      const previousTotal = 12_000_000; // 80%
      const newTotal = 12_750_000; // 85%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(false);
    });

    it('should return false when already above threshold and staying above', () => {
      const previousTotal = 14_000_000; // 93.33%
      const newTotal = 14_500_000; // 96.67%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(false);
    });
  });

  describe('below threshold (no trigger)', () => {
    it('should return false when below threshold (70% → 75%)', () => {
      const previousTotal = 10_500_000; // 70%
      const newTotal = 11_250_000; // 75%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(false);
    });

    it('should return false when below threshold (60% → 79%)', () => {
      const previousTotal = 9_000_000; // 60%
      const newTotal = 11_850_000; // 79%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(false);
    });

    it('should return false when total decreases below threshold', () => {
      const previousTotal = 11_000_000; // 73.33%
      const newTotal = 10_000_000; // 66.67%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        false
      );

      expect(result).toBe(false);
    });
  });

  describe('already triggered (AC 6)', () => {
    it('should return false when alert already triggered (hasTriggered=true)', () => {
      const previousTotal = 11_000_000;
      const newTotal = 12_500_000;

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        true // hasTriggered = true
      );

      expect(result).toBe(false);
    });

    it('should return false even when crossing threshold if already triggered', () => {
      const previousTotal = 11_999_999; // 79.999%
      const newTotal = 12_000_000; // 80.000%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        threshold,
        true // hasTriggered = true
      );

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false when budget is 0 (division by zero protection)', () => {
      const result = shouldTriggerBudgetAlert(
        10_000_000,
        12_000_000,
        0, // budget = 0
        threshold,
        false
      );

      expect(result).toBe(false);
    });

    it('should return false when budget is negative', () => {
      const result = shouldTriggerBudgetAlert(
        10_000_000,
        12_000_000,
        -15_000_000, // negative budget
        threshold,
        false
      );

      expect(result).toBe(false);
    });

    it('should handle floating-point precision correctly at threshold boundary', () => {
      const budgetAmount = 15_000_000;
      const thresholdAmount = budgetAmount * 0.8; // Exactly 12,000,000

      const previousTotal = thresholdAmount - 1; // 11,999,999
      const newTotal = thresholdAmount; // 12,000,000

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budgetAmount,
        80,
        false
      );

      expect(result).toBe(true);
    });

    it('should return false when newTotal is NaN', () => {
      const result = shouldTriggerBudgetAlert(
        10_000_000,
        NaN,
        15_000_000,
        threshold,
        false
      );

      expect(result).toBe(false);
    });

    it('should return false when previousTotal is NaN', () => {
      const result = shouldTriggerBudgetAlert(
        NaN,
        12_000_000,
        15_000_000,
        threshold,
        false
      );

      expect(result).toBe(false);
    });
  });

  describe('different threshold values', () => {
    it('should work with 100% threshold (over budget)', () => {
      const previousTotal = 14_500_000; // 96.67%
      const newTotal = 15_500_000; // 103.33%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        100, // 100% threshold
        false
      );

      expect(result).toBe(true);
    });

    it('should work with 50% threshold (halfway)', () => {
      const previousTotal = 7_000_000; // 46.67%
      const newTotal = 8_000_000; // 53.33%

      const result = shouldTriggerBudgetAlert(
        previousTotal,
        newTotal,
        budget,
        50, // 50% threshold
        false
      );

      expect(result).toBe(true);
    });
  });
});
