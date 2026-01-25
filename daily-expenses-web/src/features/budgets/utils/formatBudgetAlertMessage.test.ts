import { describe, it, expect } from 'vitest';
import { formatBudgetAlertMessage } from './formatBudgetAlertMessage';

describe('formatBudgetAlertMessage', () => {
  describe('80% threshold warning', () => {
    it('should format Vietnamese message for 80% alert', () => {
      const result = formatBudgetAlertMessage(12_000_000, 15_000_000, 80, 'vi');

      expect(result.formatted).toContain('Cảnh báo ngân sách');
      expect(result.formatted).toContain('80%');
      expect(result.formatted).toContain('12M');
      expect(result.formatted).toContain('15M');
    });

    it('should format English message for 80% alert', () => {
      const result = formatBudgetAlertMessage(12_000_000, 15_000_000, 80, 'en');

      expect(result.formatted).toContain('Budget Alert');
      expect(result.formatted).toContain('80%');
      expect(result.formatted).toContain('12M');
      expect(result.formatted).toContain('15M');
    });
  });

  describe('100% threshold over-budget', () => {
    it('should format Vietnamese message for over-budget alert', () => {
      const result = formatBudgetAlertMessage(15_500_000, 15_000_000, 100, 'vi');

      expect(result.formatted).toContain('Vượt quá ngân sách');
      expect(result.formatted).toContain('vượt quá ngân sách hàng tháng');
      expect(result.formatted).toContain('500,000đ');
    });

    it('should format English message for over-budget alert', () => {
      const result = formatBudgetAlertMessage(15_500_000, 15_000_000, 100, 'en');

      expect(result.formatted).toContain('Over Budget');
      expect(result.formatted).toContain('exceeded your monthly budget');
      expect(result.formatted).toContain('500,000đ');
    });

    it('should calculate excess amount correctly', () => {
      const spent = 18_000_000; // 3M over
      const budget = 15_000_000;

      const result = formatBudgetAlertMessage(spent, budget, 100, 'vi');

      expect(result.formatted).toContain('3,000,000đ');
    });

    it('should handle large excess amounts', () => {
      const spent = 25_000_000; // 10M over
      const budget = 15_000_000;

      const result = formatBudgetAlertMessage(spent, budget, 100, 'vi');

      expect(result.formatted).toContain('10,000,000đ');
    });
  });

  describe('number formatting', () => {
    it('should format numbers with thousand separators', () => {
      const result = formatBudgetAlertMessage(12_500_000, 15_000_000, 80, 'vi');

      // Should have thousands separator
      expect(result.formatted).toMatch(/12[,.]5M/);
    });

    it('should format excess amount with thousands separator', () => {
      const result = formatBudgetAlertMessage(16_234_567, 15_000_000, 100, 'vi');

      // Excess = 1,234,567
      expect(result.formatted).toContain('1,234,567đ');
    });

    it('should use million notation for brevity (12M instead of 12,000,000)', () => {
      const result = formatBudgetAlertMessage(12_000_000, 15_000_000, 80, 'vi');

      expect(result.formatted).toContain('12M');
      expect(result.formatted).toContain('15M');
    });
  });

  describe('default language', () => {
    it('should default to Vietnamese when language not specified', () => {
      const result = formatBudgetAlertMessage(12_000_000, 15_000_000, 80);

      expect(result.formatted).toContain('Cảnh báo ngân sách');
      expect(result.formatted).toContain('Bạn đã dùng');
    });
  });

  describe('edge cases', () => {
    it('should handle spending exactly at budget (100%)', () => {
      const result = formatBudgetAlertMessage(15_000_000, 15_000_000, 100, 'vi');

      // Excess should be 0
      expect(result.formatted).toContain('0đ');
    });

    it('should handle very small excess amounts', () => {
      const result = formatBudgetAlertMessage(15_000_001, 15_000_000, 100, 'vi');

      expect(result.formatted).toContain('1đ');
    });

    it('should handle zero budget gracefully', () => {
      const result = formatBudgetAlertMessage(1_000_000, 0, 80, 'vi');

      // Should not crash - return reasonable message
      expect(result.formatted).toBeDefined();
    });
  });
});
