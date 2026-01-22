/**
 * Tests for useExpenses hook
 * Verifies offline fallback and data merging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { useExpenses } from './useExpenses';
import * as expensesApi from '../api/expensesApi';
import * as indexedDBService from '../../../services/indexeddb/index';
import * as useOnlineStatus from '../../../hooks/useOnlineStatus';
import * as useAuth from '../../../contexts/AuthContext';
import * as jwtHelper from '../../../shared/utils/jwtHelper';

vi.mock('../api/expensesApi');
vi.mock('../../../services/indexeddb/index');
vi.mock('../../../hooks/useOnlineStatus');
vi.mock('../../../contexts/AuthContext');
vi.mock('../../../shared/utils/jwtHelper', () => ({
  getUserIdFromToken: vi.fn(() => 'test-user-123'),
}));

describe('useExpenses', () => {
  let queryClient: QueryClient;

  let wrapper: React.FC<{ children: ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock auth context
    vi.spyOn(useAuth, 'useAuth').mockReturnValue({
      accessToken: 'test-token',
      setAccessToken: function (token: string | null): void {
        throw new Error('Function not implemented.');
      },
      isAuthenticated: false
    });

    wrapper = ({ children }: { children: ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );
  });

  it('should fetch from API when online', async () => {
    // Mock online status
    vi.spyOn(useOnlineStatus, 'useOnlineStatus').mockReturnValue(true);

    const mockExpenses = [
      {
        id: '1',
        userId: 'test-user-123',
        amount: 50000,
        note: 'Test expense',
        date: '2026-01-22',
        createdAt: '2026-01-22T10:00:00Z',
        updatedAt: '2026-01-22T10:00:00Z',
      },
    ];

    vi.spyOn(expensesApi, 'getExpenses').mockResolvedValue(mockExpenses);

    const { result } = renderHook(() => useExpenses(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockExpenses);
    });

    expect(expensesApi.getExpenses).toHaveBeenCalled();
    expect(indexedDBService.getExpenses).not.toHaveBeenCalled();
  });

  it('should fetch from IndexedDB when offline', async () => {
    // Mock offline status
    vi.spyOn(useOnlineStatus, 'useOnlineStatus').mockReturnValue(false);

    const mockOfflineExpenses = [
      {
        id: 'temp-123',
        userId: 'test-user-123',
        amount: 30000,
        note: 'Offline expense',
        date: '2026-01-22',
        createdAt: '2026-01-22T10:00:00Z',
        pending_sync: true,
        syncStatus: 'pending' as const,
        localOnly: true,
      },
    ];

    vi.spyOn(indexedDBService, 'getExpenses').mockResolvedValue(mockOfflineExpenses);

    const { result } = renderHook(() => useExpenses(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(indexedDBService.getExpenses).toHaveBeenCalledWith('test-user-123');
    expect(expensesApi.getExpenses).not.toHaveBeenCalled();

    // Verify pending_sync fields are included
    const data = result.current.data || [];
    expect(data[0]).toMatchObject({
      pending_sync: true,
      syncStatus: 'pending',
      localOnly: true,
    });
  });

  it('should return empty array when offline and no userId', async () => {
    vi.spyOn(useOnlineStatus, 'useOnlineStatus').mockReturnValue(false);
    vi.spyOn(useAuth, 'useAuth').mockReturnValue({
      accessToken: null,
      setAccessToken: function (token: string | null): void {
        throw new Error('Function not implemented.');
      },
      isAuthenticated: false
    });
    
    // Mock getUserIdFromToken to return null when there's no accessToken
    vi.spyOn(jwtHelper, 'getUserIdFromToken').mockReturnValue(null);

    const { result } = renderHook(() => useExpenses(), { wrapper });

    // Query should be disabled without userId
    expect(result.current.data).toBeUndefined();
    expect(indexedDBService.getExpenses).not.toHaveBeenCalled();
  });
});
