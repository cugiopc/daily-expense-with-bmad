// TypeScript types for Budget feature
// Follows Story 3.1 database schema and Story 3.2 API contracts
// Epic 3: Budget Management & Alerts

export interface CreateBudgetDto {
  month: string; // ISO 8601 date string for first day of month (YYYY-MM-01)
  amount: number; // Budget amount in VND (e.g., 15000000)
}

export interface BudgetResponse {
  id: string;
  userId: string;
  month: string; // ISO 8601 date string (YYYY-MM-01)
  amount: number; // Budget amount in VND
  createdAt: string; // ISO 8601 datetime string with Z suffix
}

export interface Budget extends BudgetResponse {
  // Future: Add offline-first support if needed (not required for Story 3.2)
}

// ApiResponse wrapper is already defined in expense.types.ts
// Reuse that type for consistency across features
export interface ApiResponse<T> {
  data: T;
  success: boolean;
}
