/**
 * Type definitions for IndexedDB Offline Storage
 */

export interface OfflineExpense {
  id: string; // UUID - temporary ID for offline-created expenses
  userId: string;
  amount: number;
  note: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  createdAt: string; // ISO 8601 timestamp with Z suffix
  updatedAt?: string;
  pending_sync: boolean; // Flag for sync queue
  syncStatus: 'pending' | 'synced' | 'failed';
  localOnly: boolean; // True if created offline
  tempId?: string; // Original temp ID during sync process
}

export interface SyncQueueItem {
  id?: number; // Auto-increment primary key
  tempId: string;
  expense: OfflineExpense;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface IndexedDBError extends Error {
  code?: string;
  quotaExceeded?: boolean;
}
