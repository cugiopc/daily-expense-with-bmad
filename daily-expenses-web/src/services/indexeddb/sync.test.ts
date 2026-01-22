import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncOfflineExpenses } from './sync';
import * as indexedDBService from './index';
import * as apiClient from '../api/apiClient';
import { OfflineExpense } from './types';

vi.mock('../api/apiClient');
vi.mock('./index');

describe('Sync Manager', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync pending expenses and update IndexedDB with server IDs', async () => {
    const pendingExpenses: OfflineExpense[] = [
      {
        id: 'temp-uuid-123',
        userId: testUserId,
        amount: 45000,
        note: 'Offline expense 1',
        date: '2026-01-22',
        createdAt: '2026-01-22T09:30:00Z',
        pending_sync: true,
        syncStatus: 'pending',
        localOnly: true,
      },
      {
        id: 'temp-uuid-456',
        userId: testUserId,
        amount: 30000,
        note: 'Offline expense 2',
        date: '2026-01-22',
        createdAt: '2026-01-22T10:00:00Z',
        pending_sync: true,
        syncStatus: 'pending',
        localOnly: true,
      },
    ];

    // Mock getting pending expenses
    vi.spyOn(indexedDBService, 'getPendingSyncExpenses').mockResolvedValue(
      pendingExpenses
    );

    // Mock API sync response (Axios response format)
    const mockApiResponse = {
      data: {
        data: {
          synced: [
            {
              tempId: 'temp-uuid-123',
              serverId: 'server-id-123',
            },
            {
              tempId: 'temp-uuid-456',
              serverId: 'server-id-456',
            },
          ],
        },
        success: true,
      },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as any,
    };

    vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockApiResponse);

    // Mock updateExpense
    const updateExpenseMock = vi
      .spyOn(indexedDBService, 'updateExpense')
      .mockResolvedValue({} as OfflineExpense);

    // Execute sync (disable toast for tests)
    const result = await syncOfflineExpenses(testUserId, false);

    // Verify API was called with correct payload
    expect(apiClient.apiClient.post).toHaveBeenCalledWith('/api/expenses/sync', [
      {
        tempId: 'temp-uuid-123',
        amount: 45000,
        note: 'Offline expense 1',
        date: '2026-01-22',
        createdAt: '2026-01-22T09:30:00Z',
      },
      {
        tempId: 'temp-uuid-456',
        amount: 30000,
        note: 'Offline expense 2',
        date: '2026-01-22',
        createdAt: '2026-01-22T10:00:00Z',
      },
    ]);

    // Verify IndexedDB updates
    expect(updateExpenseMock).toHaveBeenCalledTimes(2);

    expect(updateExpenseMock).toHaveBeenCalledWith('temp-uuid-123', {
      id: 'server-id-123',
      pending_sync: false,
      syncStatus: 'synced',
    });

    expect(updateExpenseMock).toHaveBeenCalledWith('temp-uuid-456', {
      id: 'server-id-456',
      pending_sync: false,
      syncStatus: 'synced',
    });

    // Verify result
    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(2);
  });

  it('should return early if no pending expenses', async () => {
    vi.spyOn(indexedDBService, 'getPendingSyncExpenses').mockResolvedValue([]);

    const apiPostSpy = vi.spyOn(apiClient.apiClient, 'post');

    const result = await syncOfflineExpenses(testUserId, false);

    expect(apiPostSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(0);
  });

  it('should handle sync failure and mark expenses as failed', async () => {
    const pendingExpenses: OfflineExpense[] = [
      {
        id: 'temp-uuid-123',
        userId: testUserId,
        amount: 45000,
        note: 'Offline expense',
        date: '2026-01-22',
        createdAt: '2026-01-22T09:30:00Z',
        pending_sync: true,
        syncStatus: 'pending',
        localOnly: true,
      },
    ];

    vi.spyOn(indexedDBService, 'getPendingSyncExpenses').mockResolvedValue(
      pendingExpenses
    );

    // Mock API error
    vi.spyOn(apiClient.apiClient, 'post').mockRejectedValue(
      new Error('Network error')
    );

    const updateExpenseMock = vi
      .spyOn(indexedDBService, 'updateExpense')
      .mockResolvedValue({} as OfflineExpense);

    // Disable toast for tests
    const result = await syncOfflineExpenses(testUserId, false);

    // Verify expense marked as failed
    expect(updateExpenseMock).toHaveBeenCalledWith('temp-uuid-123', {
      syncStatus: 'failed',
    });

    // Verify result
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
    expect(result.errorType).toBe('unknown');
  });
});
