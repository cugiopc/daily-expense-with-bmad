/**
 * Sync Manager
 * Handles synchronization of offline-created expenses to server
 */

import { getPendingSyncExpenses, updateExpense } from './index';
import { apiClient } from '../api/apiClient';
import { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  recordAttempt,
  resetRetryState,
  canRetry,
  getRetryState,
} from './retryManager';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  error?: string;
  errorType?: 'network' | 'validation' | 'server' | 'unknown';
}

export interface SyncExpensePayload {
  tempId: string;
  amount: number;
  note?: string | null;
  date: string;
  createdAt: string;
}

export interface SyncExpenseResponse {
  synced: Array<{
    tempId: string;
    serverId: string;
  }>;
}

/**
 * Categorize error type from Axios error
 */
function categorizeError(error: unknown): {
  type: 'network' | 'validation' | 'server' | 'unknown';
  message: string;
} {
  if (error instanceof AxiosError) {
    // Network error (offline, timeout, DNS failure)
    if (!error.response) {
      return {
        type: 'network',
        message: error.message || 'Mất kết nối mạng',
      };
    }

    // Validation error (400 Bad Request)
    if (error.response.status === 400) {
      const errorData = error.response.data;
      const validationMessage =
        errorData?.data?.Message || 'Dữ liệu không hợp lệ';

      return {
        type: 'validation',
        message: validationMessage,
      };
    }

    // Server error (500, 502, 503, etc.)
    if (error.response.status >= 500) {
      return {
        type: 'server',
        message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      };
    }

    // Authentication error (401)
    if (error.response.status === 401) {
      return {
        type: 'server',
        message: 'Phiên đăng nhập hết hạn',
      };
    }

    // Other HTTP errors
    return {
      type: 'unknown',
      message: error.message || 'Đồng bộ thất bại',
    };
  }

  // Non-Axios errors
  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'Lỗi không xác định',
  };
}

/**
 * Sync all pending offline expenses to server with retry support
 * @param userId Current user ID
 * @param showToast Whether to show toast notifications (default: true)
 * @returns Sync result with count of synced expenses
 */
export async function syncOfflineExpenses(
  userId: string,
  showToast = true
): Promise<SyncResult> {
  try {
    console.log('[SyncManager] Starting sync for user:', userId);

    // Get all pending expenses from IndexedDB
    const pendingExpenses = await getPendingSyncExpenses(userId);

    if (pendingExpenses.length === 0) {
      console.log('[SyncManager] No pending expenses to sync');
      return { success: true, syncedCount: 0 };
    }

    console.log(
      `[SyncManager] Found ${pendingExpenses.length} expenses to sync`
    );

    // Create sync payload
    const syncPayload: SyncExpensePayload[] = pendingExpenses.map((expense) => ({
      tempId: expense.id,
      amount: expense.amount,
      note: expense.note,
      date: expense.date,
      createdAt: expense.createdAt,
    }));

    // POST to sync endpoint
    const response: AxiosResponse<{ data: SyncExpenseResponse; success: boolean }> =
      await apiClient.post('/api/expenses/sync', syncPayload);

    if (!response.data || !response.data.data || !response.data.data.synced) {
      throw new Error('Invalid sync response from server');
    }

    const syncData = response.data.data;

    // Update IndexedDB with server IDs
    for (const mapping of syncData.synced) {
      await updateExpense(mapping.tempId, {
        id: mapping.serverId,
        pending_sync: false,
        syncStatus: 'synced',
      });

      console.log(
        `[SyncManager] Updated expense: ${mapping.tempId} → ${mapping.serverId}`
      );
    }

    console.log(
      `[SyncManager] Sync completed successfully: ${syncData.synced.length} expenses synced`
    );

    // Reset retry state on success
    resetRetryState(userId);

    // Show success toast
    if (showToast && syncData.synced.length > 0) {
      toast.success(`Đã đồng bộ ${syncData.synced.length} khoản chi`);
    }

    return {
      success: true,
      syncedCount: syncData.synced.length,
    };
  } catch (error) {
    // Categorize error
    const { type, message } = categorizeError(error);

    console.error('[SyncManager] Sync failed:', {
      type,
      message,
      error,
    });

    // Record retry attempt
    recordAttempt(userId);
    const retryState = getRetryState(userId);

    // Mark expenses as failed in IndexedDB
    const pendingExpenses = await getPendingSyncExpenses(userId);
    for (const expense of pendingExpenses) {
      await updateExpense(expense.id, {
        syncStatus: 'failed',
      });
    }

    // Show error toast with retry info
    if (showToast) {
      if (retryState.attemptCount >= 3) {
        // Max retries reached
        toast.error('Đồng bộ thất bại sau 3 lần thử. Vui lòng thử lại thủ công.', {
          duration: 6000,
        });
      } else {
        // Will retry automatically
        toast.error('Đồng bộ thất bại. Sẽ tự động thử lại khi có kết nối.', {
          duration: 5000,
        });
      }
    }

    return {
      success: false,
      syncedCount: 0,
      error: message,
      errorType: type,
    };
  }
}

/**
 * Sync with retry logic - checks if retry is allowed before syncing
 * @param userId Current user ID
 * @param showToast Whether to show toast notifications
 * @returns Sync result
 */
export async function syncWithRetry(
  userId: string,
  showToast = true
): Promise<SyncResult> {
  // Check if retry is allowed
  if (!canRetry(userId)) {
    const retryState = getRetryState(userId);

    console.log('[SyncManager] Retry not allowed:', {
      attemptCount: retryState.attemptCount,
      nextRetryTime: retryState.nextRetryTime,
    });

    return {
      success: false,
      syncedCount: 0,
      error: 'Max retry attempts reached',
      errorType: 'unknown',
    };
  }

  // Attempt sync
  return syncOfflineExpenses(userId, showToast);
}
