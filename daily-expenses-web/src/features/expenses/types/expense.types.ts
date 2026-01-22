// TypeScript types for Expense feature
// Follows Story 2.1 database schema and Story 2.2 API contracts

export interface CreateExpenseDto {
  amount: number;
  note?: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
}

export interface UpdateExpenseDto {
  amount: number;
  note?: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
}

export interface ExpenseResponse {
  id: string;
  userId: string;
  amount: number;
  note: string | null;
  date: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

export interface Expense extends ExpenseResponse {
  // Offline-first support (Story 2.10)
  pending_sync?: boolean; // True if expense was created offline and needs sync
  syncStatus?: 'pending' | 'synced' | 'failed'; // Sync status
  localOnly?: boolean; // True if created offline
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}
