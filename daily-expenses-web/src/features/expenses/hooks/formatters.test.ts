import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDateHeader, formatCurrency, formatTime } from './formatters';

describe('formatters', () => {
  // Mock current date for consistent testing
  const mockToday = new Date('2026-01-21T10:00:00Z');
  let originalDate: DateConstructor;

  beforeAll(() => {
    originalDate = global.Date;
    // @ts-ignore
    global.Date = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(mockToday);
        } else {
          super(...args);
        }
      }
      static now() {
        return mockToday.getTime();
      }
    } as DateConstructor;
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  describe('getDateHeader', () => {
    it('should return "Hôm nay" for today', () => {
      const today = new Date('2026-01-21T10:00:00Z');
      expect(getDateHeader(today)).toBe('Hôm nay');
    });

    it('should return "Hôm qua" for yesterday', () => {
      const yesterday = new Date('2026-01-20T10:00:00Z');
      expect(getDateHeader(yesterday)).toBe('Hôm qua');
    });

    it('should return formatted date for earlier dates', () => {
      const earlier = new Date('2026-01-15T10:00:00Z');
      const result = getDateHeader(earlier);
      // Format: "15 Tháng 1, 2026" or similar
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2026/);
    });

    it('should handle date from previous month', () => {
      const previousMonth = new Date('2025-12-31T10:00:00Z');
      const result = getDateHeader(previousMonth);
      expect(result).toMatch(/31/);
      expect(result).toMatch(/2025/);
    });
  });

  describe('formatCurrency', () => {
    it('should format Vietnamese currency with đ symbol', () => {
      const result = formatCurrency(50000);
      expect(result).toContain('50');
      expect(result).toContain('₫');
    });

    it('should format with thousands separators', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1');
      expect(result).toContain('000');
      expect(result).toContain('₫');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
      expect(result).toContain('₫');
    });

    it('should not show decimal places after the number', () => {
      const result = formatCurrency(50000);
      // Should be "50.000 ₫" with dots as thousands separators, not decimals
      expect(result).toMatch(/^\d{1,3}(\.\d{3})*\s₫$/);
      expect(result).not.toMatch(/,\d+/); // No comma decimals
    });
  });

  describe('formatTime', () => {
    it('should format time in 12-hour format with AM/PM', () => {
      const morning = new Date('2026-01-21T09:30:00Z');
      const result = formatTime(morning);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
      expect(result.toLowerCase()).toMatch(/am|pm/i);
    });

    it('should handle afternoon time', () => {
      const afternoon = new Date('2026-01-21T14:30:00Z');
      const result = formatTime(afternoon);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
      expect(result.toLowerCase()).toMatch(/pm/i);
    });

    it('should handle midnight', () => {
      const midnight = new Date('2026-01-21T00:00:00Z');
      const result = formatTime(midnight);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle noon', () => {
      const noon = new Date('2026-01-21T12:00:00Z');
      const result = formatTime(noon);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
      expect(result.toLowerCase()).toMatch(/pm/i);
    });
  });
});
