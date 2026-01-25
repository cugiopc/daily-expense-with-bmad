/**
 * getBudgetStatus Utility Tests
 *
 * Test Coverage:
 * - Color threshold logic: <80% green, 80-100% yellow, >100% red
 * - Edge cases: 0%, 79%, 80%, 100%, 101%, 107%
 * - Return value structure: color, label, severity
 */

import { describe, it, expect } from 'vitest';
import { createTheme } from '@mui/material/styles';
import { getBudgetStatus } from './budgetStatus';

const theme = createTheme();

describe('getBudgetStatus', () => {
  describe('Green status (< 80%)', () => {
    it('should return green status for 0% usage', () => {
      const status = getBudgetStatus(0, theme);

      expect(status.severity).toBe('success');
      expect(status.label).toBe('Đang theo dõi');
    });

    it('should return green status for 50% usage', () => {
      const status = getBudgetStatus(50, theme);

      expect(status.severity).toBe('success');
      expect(status.label).toBe('Đang theo dõi');
    });

    it('should return green status for 79% usage (just below threshold)', () => {
      const status = getBudgetStatus(79, theme);

      expect(status.severity).toBe('success');
      expect(status.label).toBe('Đang theo dõi');
    });

    it('should return green status for 79.9% usage', () => {
      const status = getBudgetStatus(79.9, theme);

      expect(status.severity).toBe('success');
      expect(status.label).toBe('Đang theo dõi');
    });
  });

  describe('Yellow/Warning status (80-100%)', () => {
    it('should return warning status for exactly 80% usage', () => {
      const status = getBudgetStatus(80, theme);

      expect(status.severity).toBe('warning');
      expect(status.label).toBe('Gần đạt giới hạn');
    });

    it('should return warning status for 90% usage', () => {
      const status = getBudgetStatus(90, theme);

      expect(status.severity).toBe('warning');
      expect(status.label).toBe('Gần đạt giới hạn');
    });

    it('should return warning status for exactly 100% usage', () => {
      const status = getBudgetStatus(100, theme);

      expect(status.severity).toBe('warning');
      expect(status.label).toBe('Gần đạt giới hạn');
    });
  });

  describe('Red/Error status (> 100%)', () => {
    it('should return error status for 100.1% usage (just over)', () => {
      const status = getBudgetStatus(100.1, theme);

      expect(status.severity).toBe('error');
      expect(status.label).toBe('Vượt quá ngân sách');
    });

    it('should return error status for 107% usage', () => {
      const status = getBudgetStatus(107, theme);

      expect(status.severity).toBe('error');
      expect(status.label).toBe('Vượt quá ngân sách');
    });

    it('should return error status for 200% usage', () => {
      const status = getBudgetStatus(200, theme);

      expect(status.severity).toBe('error');
      expect(status.label).toBe('Vượt quá ngân sách');
    });
  });

  describe('Return value structure', () => {
    it('should return object with color, label, and severity fields', () => {
      const status = getBudgetStatus(50, theme);

      expect(status).toHaveProperty('color');
      expect(status).toHaveProperty('label');
      expect(status).toHaveProperty('severity');
      expect(typeof status.color).toBe('string');
      expect(typeof status.label).toBe('string');
      expect(['success', 'warning', 'error']).toContain(status.severity);
    });
  });
});
