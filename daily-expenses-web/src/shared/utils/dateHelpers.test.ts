import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentMonth } from './dateHelpers';

describe('dateHelpers', () => {
  describe('getCurrentMonth', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return current month in YYYY-MM format', () => {
      // Set date to January 25, 2026 (local time)
      vi.setSystemTime(new Date(2026, 0, 25, 10, 0, 0));

      const result = getCurrentMonth();

      expect(result).toBe('2026-01');
    });

    it('should pad single-digit months with leading zero', () => {
      // Set date to March 2026 (local time)
      vi.setSystemTime(new Date(2026, 2, 15, 10, 0, 0));

      const result = getCurrentMonth();

      expect(result).toBe('2026-03');
    });

    it('should handle December correctly', () => {
      // December 31, 2025 23:59:59 local time
      vi.setSystemTime(new Date(2025, 11, 31, 23, 59, 59));

      const result = getCurrentMonth();

      expect(result).toBe('2025-12');
    });

    it('should handle January correctly', () => {
      // January 1, 2026 00:00:00 local time
      vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0));

      const result = getCurrentMonth();

      expect(result).toBe('2026-01');
    });

    it('should handle month boundary transition (Dec 31 → Jan 1)', () => {
      // December 31, 2025 (local time)
      vi.setSystemTime(new Date(2025, 11, 31, 23, 59, 59));
      expect(getCurrentMonth()).toBe('2025-12');

      // January 1, 2026 (local time)
      vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 1));
      expect(getCurrentMonth()).toBe('2026-01');
    });

    it('should return different months across year boundary', () => {
      // December 2025 (local time)
      vi.setSystemTime(new Date(2025, 11, 15, 10, 0, 0));
      const dec2025 = getCurrentMonth();

      // January 2026 (local time)
      vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0));
      const jan2026 = getCurrentMonth();

      expect(dec2025).toBe('2025-12');
      expect(jan2026).toBe('2026-01');
      expect(dec2025).not.toBe(jan2026);
    });

    it('should return valid YYYY-MM format regardless of timezone', () => {
      // Any date should return valid format
      vi.setSystemTime(new Date(2026, 5, 15, 12, 30, 45));

      const result = getCurrentMonth();

      // Verify format: YYYY-MM (4 digits - 2 digits)
      expect(result).toMatch(/^\d{4}-\d{2}$/);
      expect(result).toBe('2026-06');
    });
  });
});
