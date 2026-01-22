import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateBackoffDelay,
  getRetryState,
  canRetry,
  recordAttempt,
  resetRetryState,
  getTimeUntilNextRetry,
} from './retryManager';

describe('RetryManager', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    vi.useFakeTimers();
    resetRetryState(testUserId);
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      expect(calculateBackoffDelay(1)).toBe(5000); // 5s * 2^0 = 5s
      expect(calculateBackoffDelay(2)).toBe(10000); // 5s * 2^1 = 10s
      expect(calculateBackoffDelay(3)).toBe(20000); // 5s * 2^2 = 20s
    });

    it('should cap delay at maxDelayMs', () => {
      expect(calculateBackoffDelay(10)).toBe(30000); // Capped at 30s
    });

    it('should respect custom config', () => {
      const customConfig = {
        maxAttempts: 3,
        baseDelayMs: 2000,
        maxDelayMs: 10000,
      };

      expect(calculateBackoffDelay(1, customConfig)).toBe(2000); // 2s * 2^0 = 2s
      expect(calculateBackoffDelay(2, customConfig)).toBe(4000); // 2s * 2^1 = 4s
      expect(calculateBackoffDelay(3, customConfig)).toBe(8000); // 2s * 2^2 = 8s
      expect(calculateBackoffDelay(4, customConfig)).toBe(10000); // Capped at 10s
    });
  });

  describe('getRetryState', () => {
    it('should initialize state for new user', () => {
      const state = getRetryState(testUserId);

      expect(state.attemptCount).toBe(0);
      expect(state.lastAttemptTime).toBeNull();
      expect(state.nextRetryTime).toBeNull();
    });

    it('should return same state object for same user', () => {
      const state1 = getRetryState(testUserId);
      const state2 = getRetryState(testUserId);

      expect(state1).toBe(state2);
    });
  });

  describe('canRetry', () => {
    it('should allow retry on first attempt', () => {
      expect(canRetry(testUserId)).toBe(true);
    });

    it('should prevent retry before backoff period', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));
      recordAttempt(testUserId);

      // Immediately after attempt, can't retry
      expect(canRetry(testUserId)).toBe(false);

      // After 4 seconds (less than 5s backoff), still can't retry
      vi.advanceTimersByTime(4000);
      expect(canRetry(testUserId)).toBe(false);
    });

    it('should allow retry after backoff period', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));
      recordAttempt(testUserId);

      // After 5 seconds (backoff period), can retry
      vi.advanceTimersByTime(5000);
      expect(canRetry(testUserId)).toBe(true);
    });

    it('should prevent retry after max attempts', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));

      // Record 3 failed attempts
      recordAttempt(testUserId);
      vi.advanceTimersByTime(5000);

      recordAttempt(testUserId);
      vi.advanceTimersByTime(10000);

      recordAttempt(testUserId);

      // After max attempts, can't retry even after waiting
      expect(canRetry(testUserId)).toBe(false);

      vi.advanceTimersByTime(60000); // Wait 1 minute
      expect(canRetry(testUserId)).toBe(false);
    });
  });

  describe('recordAttempt', () => {
    it('should increment attempt count and set next retry time', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));

      recordAttempt(testUserId);
      const state = getRetryState(testUserId);

      expect(state.attemptCount).toBe(1);
      expect(state.lastAttemptTime).toBe(Date.now());
      expect(state.nextRetryTime).toBe(Date.now() + 5000); // 5s backoff
    });

    it('should use exponential backoff for subsequent attempts', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));

      recordAttempt(testUserId);
      const firstRetryTime = getRetryState(testUserId).nextRetryTime!;

      vi.advanceTimersByTime(5000);
      recordAttempt(testUserId);
      const secondRetryTime = getRetryState(testUserId).nextRetryTime!;

      // Second retry should be 10s after second attempt (not 5s)
      expect(secondRetryTime - firstRetryTime).toBe(10000);
    });

    it('should set nextRetryTime to null after max attempts', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));

      recordAttempt(testUserId);
      vi.advanceTimersByTime(5000);

      recordAttempt(testUserId);
      vi.advanceTimersByTime(10000);

      recordAttempt(testUserId);

      const state = getRetryState(testUserId);
      expect(state.attemptCount).toBe(3);
      expect(state.nextRetryTime).toBeNull();
    });
  });

  describe('resetRetryState', () => {
    it('should reset state after successful sync', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));

      // Record some attempts
      recordAttempt(testUserId);
      vi.advanceTimersByTime(5000);
      recordAttempt(testUserId);

      // Reset
      resetRetryState(testUserId);

      const state = getRetryState(testUserId);
      expect(state.attemptCount).toBe(0);
      expect(state.lastAttemptTime).toBeNull();
      expect(state.nextRetryTime).toBeNull();
    });
  });

  describe('getTimeUntilNextRetry', () => {
    it('should return null if no retry scheduled', () => {
      expect(getTimeUntilNextRetry(testUserId)).toBeNull();
    });

    it('should return time remaining until next retry', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));

      recordAttempt(testUserId);

      // Should be 5000ms until next retry
      expect(getTimeUntilNextRetry(testUserId)).toBe(5000);

      // Advance 2 seconds
      vi.advanceTimersByTime(2000);
      expect(getTimeUntilNextRetry(testUserId)).toBe(3000);

      // Advance to exactly retry time
      vi.advanceTimersByTime(3000);
      expect(getTimeUntilNextRetry(testUserId)).toBe(0);
    });

    it('should return null after max attempts', () => {
      vi.setSystemTime(new Date('2026-01-22T10:00:00Z'));

      recordAttempt(testUserId);
      vi.advanceTimersByTime(5000);

      recordAttempt(testUserId);
      vi.advanceTimersByTime(10000);

      recordAttempt(testUserId);

      expect(getTimeUntilNextRetry(testUserId)).toBeNull();
    });
  });
});
