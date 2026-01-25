import { describe, it, expect } from 'vitest';
import { calculateMonthEndProjection } from './calculateMonthEndProjection';

describe('calculateMonthEndProjection', () => {
  // AC 1: Basic calculation
  it('should return 12,400,000 when dailyAverage is 400K and month has 31 days (January)', () => {
    const currentDate = new Date('2026-01-15T00:00:00Z');
    const dailyAverage = 400_000;

    const result = calculateMonthEndProjection(dailyAverage, currentDate);

    expect(result).toBe(12_400_000);
  });

  // AC 2: Different month lengths - 31-day months
  it('should handle 31-day months correctly (January, March, May, July, August, October, December)', () => {
    const dailyAverage = 400_000;
    const expected = 400_000 * 31; // 12,400,000

    const januaryDate = new Date('2026-01-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, januaryDate)).toBe(expected);

    const marchDate = new Date('2026-03-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, marchDate)).toBe(expected);

    const mayDate = new Date('2026-05-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, mayDate)).toBe(expected);

    const julyDate = new Date('2026-07-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, julyDate)).toBe(expected);

    const augustDate = new Date('2026-08-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, augustDate)).toBe(expected);

    const octoberDate = new Date('2026-10-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, octoberDate)).toBe(expected);

    const decemberDate = new Date('2026-12-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, decemberDate)).toBe(expected);
  });

  // AC 2: Different month lengths - 30-day months
  it('should handle 30-day months correctly (April, June, September, November)', () => {
    const dailyAverage = 400_000;
    const expected = 400_000 * 30; // 12,000,000

    const aprilDate = new Date('2026-04-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, aprilDate)).toBe(expected);

    const juneDate = new Date('2026-06-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, juneDate)).toBe(expected);

    const septemberDate = new Date('2026-09-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, septemberDate)).toBe(expected);

    const novemberDate = new Date('2026-11-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, novemberDate)).toBe(expected);
  });

  // AC 2: Different month lengths - 28-day month (non-leap year)
  it('should handle 28-day months correctly (February non-leap year)', () => {
    const dailyAverage = 400_000;
    const expected = 400_000 * 28; // 11,200,000

    const februaryDate = new Date('2026-02-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, februaryDate)).toBe(expected);
  });

  // AC 2: Different month lengths - 29-day month (leap year)
  it('should handle 29-day months correctly (February leap year 2024)', () => {
    const dailyAverage = 400_000;
    const expected = 400_000 * 29; // 11,600,000

    const februaryLeapDate = new Date('2024-02-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, februaryLeapDate)).toBe(expected);
  });

  it('should handle 29-day months correctly (February leap year 2028)', () => {
    const dailyAverage = 400_000;
    const expected = 400_000 * 29; // 11,600,000

    const februaryLeapDate = new Date('2028-02-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, februaryLeapDate)).toBe(expected);
  });

  // AC 2: Century leap year edge cases (divisible by 4, except centuries unless divisible by 400)
  it('should handle century non-leap year correctly (2100 is NOT a leap year)', () => {
    const dailyAverage = 400_000;
    const expected = 400_000 * 28; // 11,200,000 (2100 NOT leap: divisible by 100 but not 400)

    const february2100 = new Date('2100-02-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, february2100)).toBe(expected);
  });

  it('should handle century leap year correctly (2000 IS a leap year)', () => {
    const dailyAverage = 400_000;
    const expected = 400_000 * 29; // 11,600,000 (2000 IS leap: divisible by 400)

    const february2000 = new Date('2000-02-15T00:00:00Z');
    expect(calculateMonthEndProjection(dailyAverage, february2000)).toBe(expected);
  });

  // AC 7: First day of month
  it('should handle first day of month correctly (1M/day × 31 days = 31M)', () => {
    const currentDate = new Date('2026-01-01T00:00:00Z');
    const dailyAverage = 1_000_000;

    const result = calculateMonthEndProjection(dailyAverage, currentDate);

    expect(result).toBe(31_000_000);
  });

  // AC 6: Zero daily average
  it('should return 0 when dailyAverage is 0', () => {
    const currentDate = new Date('2026-01-15T00:00:00Z');
    const dailyAverage = 0;

    const result = calculateMonthEndProjection(dailyAverage, currentDate);

    expect(result).toBe(0);
  });

  // AC 9: Daily progression - projection decreases when pace slows
  it('should decrease projection when dailyAverage decreases (pace slowing)', () => {
    const januaryDate = new Date('2026-01-15T00:00:00Z');

    const projectionDay15 = calculateMonthEndProjection(400_000, januaryDate);
    const projectionDay16 = calculateMonthEndProjection(375_000, januaryDate);

    expect(projectionDay16).toBeLessThan(projectionDay15);
    expect(projectionDay15).toBe(12_400_000);
    expect(projectionDay16).toBe(11_625_000);
  });

  // Edge cases: Large amounts without precision loss
  it('should handle large amounts without precision loss', () => {
    const currentDate = new Date('2026-01-15T00:00:00Z');
    const dailyAverage = 10_000_000; // 10M per day

    const result = calculateMonthEndProjection(dailyAverage, currentDate);

    expect(result).toBe(310_000_000); // 31 days * 10M
  });

  // Edge cases: Rounding to whole VND (no decimals)
  it('should round to whole VND (no decimals)', () => {
    const currentDate = new Date('2026-01-15T00:00:00Z');
    const dailyAverage = 333_333.33; // Amount with decimals

    const result = calculateMonthEndProjection(dailyAverage, currentDate);

    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(10_333_333); // Rounded: 333_333.33 * 31 = 10_333_333.23 → 10_333_333
  });

  // Edge cases: Fractional daily average
  it('should handle fractional daily average correctly', () => {
    const currentDate = new Date('2026-04-15T00:00:00Z'); // April has 30 days
    const dailyAverage = 466_667; // 7M / 15 days = 466,666.67

    const result = calculateMonthEndProjection(dailyAverage, currentDate);

    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(14_000_010); // 466_667 * 30 = 14,000,010
  });
});
