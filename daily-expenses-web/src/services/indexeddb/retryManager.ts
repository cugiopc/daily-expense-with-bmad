/**
 * Retry Manager
 * Handles retry logic with exponential backoff for sync failures
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface RetryState {
  attemptCount: number;
  lastAttemptTime: number | null;
  nextRetryTime: number | null;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 5000, // 5 seconds
  maxDelayMs: 30000, // 30 seconds
};

// In-memory retry state (could be persisted to IndexedDB for production)
const retryStates = new Map<string, RetryState>();

/**
 * Calculate delay for next retry attempt using exponential backoff
 * Formula: min(baseDelay * 2^(attempt - 1), maxDelay)
 */
export function calculateBackoffDelay(
  attemptCount: number,
  config: RetryConfig = DEFAULT_CONFIG
): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attemptCount - 1);
  return Math.min(exponentialDelay, config.maxDelayMs);
}

/**
 * Get retry state for a user
 */
export function getRetryState(userId: string): RetryState {
  if (!retryStates.has(userId)) {
    retryStates.set(userId, {
      attemptCount: 0,
      lastAttemptTime: null,
      nextRetryTime: null,
    });
  }
  return retryStates.get(userId)!;
}

/**
 * Check if user can retry sync now
 */
export function canRetry(
  userId: string,
  config: RetryConfig = DEFAULT_CONFIG
): boolean {
  const state = getRetryState(userId);

  // If max attempts reached, can't retry
  if (state.attemptCount >= config.maxAttempts) {
    return false;
  }

  // If no previous attempt, can retry
  if (state.nextRetryTime === null) {
    return true;
  }

  // Check if enough time has passed
  return Date.now() >= state.nextRetryTime;
}

/**
 * Record a sync attempt
 */
export function recordAttempt(userId: string, config: RetryConfig = DEFAULT_CONFIG): void {
  const state = getRetryState(userId);
  state.attemptCount += 1;
  state.lastAttemptTime = Date.now();

  if (state.attemptCount < config.maxAttempts) {
    const delay = calculateBackoffDelay(state.attemptCount, config);
    state.nextRetryTime = Date.now() + delay;
  } else {
    state.nextRetryTime = null; // Max attempts reached
  }

  retryStates.set(userId, state);
}

/**
 * Reset retry state after successful sync
 */
export function resetRetryState(userId: string): void {
  retryStates.set(userId, {
    attemptCount: 0,
    lastAttemptTime: null,
    nextRetryTime: null,
  });
}

/**
 * Get time until next retry (in milliseconds)
 */
export function getTimeUntilNextRetry(userId: string): number | null {
  const state = getRetryState(userId);

  if (state.nextRetryTime === null) {
    return null;
  }

  const timeRemaining = state.nextRetryTime - Date.now();
  return Math.max(0, timeRemaining);
}
