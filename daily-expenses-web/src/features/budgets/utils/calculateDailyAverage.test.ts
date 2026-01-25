import { describe, it, expect } from 'vitest';
import { calculateDailyAverage } from './calculateDailyAverage';

describe('calculateDailyAverage', () => {
  // AC 1: Basic calculation - 6M / 15 days = 400K
  it('should return 400,000 when monthlyTotal is 6M and day is 15', () => {
    // Arrange
    const monthlyTotal = 6_000_000;
    const currentDate = new Date('2026-01-15');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(400_000);
  });

  // AC 2: Days elapsed edge cases - Day 1
  it('should handle day 1 of month (1M / 1 day = 1M)', () => {
    // Arrange
    const monthlyTotal = 1_000_000;
    const currentDate = new Date('2026-01-01');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(1_000_000);
  });

  // AC 2: Days elapsed edge cases - Last day of month
  it('should handle last day of month (12M / 31 days)', () => {
    // Arrange
    const monthlyTotal = 12_000_000;
    const currentDate = new Date('2026-01-31');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(387_097); // 12M / 31 = 387,096.77 → rounds to 387,097
  });

  // AC 5: Daily progression - same total, different days
  it('should decrease daily average as days increase with same total', () => {
    // Arrange
    const monthlyTotal = 6_000_000;
    const day15 = new Date('2026-01-15');
    const day16 = new Date('2026-01-16');

    // Act
    const averageDay15 = calculateDailyAverage(monthlyTotal, day15);
    const averageDay16 = calculateDailyAverage(monthlyTotal, day16);

    // Assert
    expect(averageDay15).toBe(400_000); // 6M / 15
    expect(averageDay16).toBe(375_000); // 6M / 16
    expect(averageDay16).toBeLessThan(averageDay15);
  });

  // AC 6: Zero spending - typical case
  it('should return 0 when monthlyTotal is 0', () => {
    // Arrange
    const monthlyTotal = 0;
    const currentDate = new Date('2026-01-15');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(0);
  });

  // AC 6: Zero spending on first day
  it('should handle first day with zero spending (0 / 1)', () => {
    // Arrange
    const monthlyTotal = 0;
    const currentDate = new Date('2026-02-01');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(0);
  });

  // Edge case: Large amounts
  it('should handle large amounts without precision loss', () => {
    // Arrange
    const monthlyTotal = 100_000_000; // 100M
    const currentDate = new Date('2026-01-30');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(3_333_333); // 100M / 30 = 3,333,333.33 → rounds to 3,333,333
  });

  // Edge case: Rounding to whole VND
  it('should round to whole VND (no decimals)', () => {
    // Arrange
    const monthlyTotal = 7_000_000;
    const currentDate = new Date('2026-01-15');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(466_667); // 7M / 15 = 466,666.67 → rounds to 466,667
    expect(Number.isInteger(result)).toBe(true);
  });

  // Edge case: February month (28 days)
  it('should handle February correctly (28 days)', () => {
    // Arrange
    const monthlyTotal = 5_600_000;
    const currentDate = new Date('2026-02-28');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(200_000); // 5.6M / 28 = 200K
  });

  // Edge case: Leap year February (29 days)
  it('should handle leap year February correctly (29 days)', () => {
    // Arrange
    const monthlyTotal = 5_800_000;
    const currentDate = new Date('2024-02-29'); // 2024 is a leap year

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert
    expect(result).toBe(200_000); // 5.8M / 29 = 200K
  });

  // CRITICAL #2: Negative amount edge case
  it('should treat negative monthlyTotal as 0 (safeguard against bad data)', () => {
    // Arrange - negative total shouldn't happen, but protect against bugs
    const monthlyTotal = -1_000_000;
    const currentDate = new Date('2026-01-15');

    // Act
    const result = calculateDailyAverage(monthlyTotal, currentDate);

    // Assert - returns 0, not negative average
    expect(result).toBe(0);
  });

  // MEDIUM #5: Timezone edge case - date at different times of day (local timezone)
  it('should use same day-of-month regardless of time of day', () => {
    // Arrange - Jan 15 at different times (local timezone, no Z suffix)
    // Date.getDate() uses local timezone, so we test with local dates
    const monthlyTotal = 6_000_000;
    const morning = new Date('2026-01-15T00:00:01'); // Just after midnight local
    const night = new Date('2026-01-15T23:59:59'); // Just before midnight local

    // Act
    const resultMorning = calculateDailyAverage(monthlyTotal, morning);
    const resultNight = calculateDailyAverage(monthlyTotal, night);

    // Assert - same result regardless of time (both are day 15)
    expect(resultMorning).toBe(400_000);
    expect(resultNight).toBe(400_000);
    expect(resultMorning).toBe(resultNight);
  });

  // MEDIUM #5: Timezone documentation - calculation uses local timezone
  it('should calculate using local timezone day-of-month', () => {
    // Arrange - Jan 15, 2026 in local timezone
    // Note: Component uses new Date() which creates date in system/local timezone
    // Date.getDate() returns day-of-month in LOCAL timezone (1-31)
    const monthlyTotal = 6_000_000;
    const localDate = new Date('2026-01-15T12:00:00'); // Noon on Jan 15 local time

    // Act
    const result = calculateDailyAverage(monthlyTotal, localDate);

    // Assert - uses day 15 from local timezone
    expect(result).toBe(400_000); // 6M / 15 = 400K
    expect(localDate.getDate()).toBe(15); // Verify getDate() returns 15
  });
});
