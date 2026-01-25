import { describe, it, expect } from 'vitest';
import { getBudgetProjectionStatus } from './budgetComparison';

describe('getBudgetProjectionStatus', () => {
  // AC 3: Warning message when projected exceeds budget
  it('should return warning when projected exceeds budget', () => {
    const projected = 12_400_000;
    const budget = 10_000_000;

    const result = getBudgetProjectionStatus(projected, budget);

    expect(result.severity).toBe('warning');
    expect(result.message).toContain('Dự kiến vượt ngân sách');
  });

  it('should include excess amount in warning message', () => {
    const projected = 12_400_000;
    const budget = 10_000_000;
    const excess = projected - budget; // 2,400,000

    const result = getBudgetProjectionStatus(projected, budget);

    expect(result.severity).toBe('warning');
    // Message should include formatted excess amount: "2.400.000 ₫"
    expect(result.message).toContain('2.400.000');
  });

  // AC 4: Success message when projected under budget
  it('should return success when projected under budget', () => {
    const projected = 12_400_000;
    const budget = 15_000_000;

    const result = getBudgetProjectionStatus(projected, budget);

    expect(result.severity).toBe('success');
    expect(result.message).toContain('Đang đúng hướng');
  });

  it('should include remaining amount in success message', () => {
    const projected = 12_400_000;
    const budget = 15_000_000;
    const remaining = budget - projected; // 2,600,000

    const result = getBudgetProjectionStatus(projected, budget);

    expect(result.severity).toBe('success');
    // Message should include formatted remaining amount: "2.600.000 ₫"
    expect(result.message).toContain('2.600.000');
  });

  // AC 5: No warning/success when budget is null
  it('should return none severity when budget is null', () => {
    const projected = 12_400_000;
    const budget = null;

    const result = getBudgetProjectionStatus(projected, budget);

    expect(result.severity).toBe('none');
    expect(result.message).toBe('');
  });

  // AC 6: Handle zero projection with no budget
  it('should handle zero projection with no budget', () => {
    const projected = 0;
    const budget = null;

    const result = getBudgetProjectionStatus(projected, budget);

    expect(result.severity).toBe('none');
    expect(result.message).toBe('');
  });

  // Edge case: Exact match (projected === budget)
  it('should handle exact match (projected === budget)', () => {
    const projected = 10_000_000;
    const budget = 10_000_000;

    const result = getBudgetProjectionStatus(projected, budget);

    // When projected equals budget, consider it success (on track)
    expect(result.severity).toBe('success');
    expect(result.message).toContain('Đang đúng hướng');
    expect(result.message).toContain('0'); // Remaining is 0
  });

  // Edge case: Zero budget (unlikely but possible)
  it('should handle zero budget edge case', () => {
    const projected = 5_000_000;
    const budget = 0;

    const result = getBudgetProjectionStatus(projected, budget);

    // Projected > budget (5M > 0), so warning
    expect(result.severity).toBe('warning');
    expect(result.message).toContain('Dự kiến vượt ngân sách');
    expect(result.message).toContain('5.000.000');
  });

  // Edge case: Projected is zero but budget is set
  it('should handle zero projection with budget set', () => {
    const projected = 0;
    const budget = 10_000_000;

    const result = getBudgetProjectionStatus(projected, budget);

    // 0 <= budget, so success
    expect(result.severity).toBe('success');
    expect(result.message).toContain('Đang đúng hướng');
    expect(result.message).toContain('10.000.000');
  });

  // Edge case: Large amounts
  it('should handle large amounts correctly', () => {
    const projected = 500_000_000; // 500M
    const budget = 300_000_000; // 300M

    const result = getBudgetProjectionStatus(projected, budget);

    expect(result.severity).toBe('warning');
    expect(result.message).toContain('200.000.000'); // 500M - 300M
  });

  // Edge case: Negative budget (defensive check)
  it('should treat negative budget as 0 (defensive check)', () => {
    const projected = 12_400_000;
    const budget = -5_000_000; // Invalid, should be treated as 0

    const result = getBudgetProjectionStatus(projected, budget);

    // Projection (12.4M) > 0, so warning
    expect(result.severity).toBe('warning');
    // Excess = 12.4M - 0 = 12.4M
    expect(result.message).toContain('12.400.000');
  });
});
