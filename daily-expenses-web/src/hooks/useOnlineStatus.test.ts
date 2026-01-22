import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  beforeEach(() => {
    // Reset navigator.onLine and event listeners
    vi.stubGlobal('navigator', {
      onLine: true,
    });
  });

  it('should return true when initially online', () => {
    vi.stubGlobal('navigator', {
      onLine: true,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);
  });

  it('should return false when initially offline', () => {
    vi.stubGlobal('navigator', {
      onLine: false,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(false);
  });

  it('should update status when going offline', () => {
    vi.stubGlobal('navigator', {
      onLine: true,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    // Simulate going offline
    act(() => {
      vi.stubGlobal('navigator', {
        onLine: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });

  it('should update status when coming back online', () => {
    vi.stubGlobal('navigator', {
      onLine: false,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(false);

    // Simulate coming online
    act(() => {
      vi.stubGlobal('navigator', {
        onLine: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });
});
