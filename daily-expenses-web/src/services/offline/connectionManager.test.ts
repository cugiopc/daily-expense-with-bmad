import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getOnlineStatus } from './connectionManager';

describe('Connection Manager', () => {
  beforeEach(() => {
    // Reset navigator.onLine before each test
    vi.stubGlobal('navigator', {
      onLine: true,
    });
  });

  it('should return true when navigator.onLine is true', () => {
    vi.stubGlobal('navigator', {
      onLine: true,
    });

    expect(getOnlineStatus()).toBe(true);
  });

  it('should return false when navigator.onLine is false', () => {
    vi.stubGlobal('navigator', {
      onLine: false,
    });

    expect(getOnlineStatus()).toBe(false);
  });
});
