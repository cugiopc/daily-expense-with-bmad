// API client functions for Budget endpoints
// Follows Story 3.2 API implementation: POST /api/budgets, GET /api/budgets, GET /api/budgets/current

import { apiClient } from '../../../services/api/apiClient.ts';
import type {
  CreateBudgetDto,
  BudgetResponse,
  ApiResponse,
} from '../types/budget.types';

/**
 * Create a new budget or update existing budget for a month (UPSERT pattern)
 * POST /api/budgets
 *
 * @param data - Budget data (month, amount)
 * @returns BudgetResponse with server-generated ID and timestamps
 *
 * Requirements from Story 3.2:
 * - Requires JWT authentication (handled by axios interceptor)
 * - Amount > 0 validated on backend
 * - Month is normalized to first day of month on backend
 * - If budget exists for month, it will be updated (returns 200 OK)
 * - If budget doesn't exist, it will be created (returns 201 Created)
 */
export async function createBudget(
  data: CreateBudgetDto
): Promise<BudgetResponse> {
  try {
    const response = await apiClient.post<ApiResponse<BudgetResponse>>(
      '/api/budgets',
      {
        month: data.month,
        amount: data.amount,
      }
    );

    if (!response.data.success) {
      const errorMsg = (response.data.data as any)?.message || 'Unknown error';
      throw new Error(`Failed to create budget: ${errorMsg}`);
    }

    return response.data.data;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.data?.message || error.message;
    const errorMsg = status === 400
      ? `Validation failed: ${message}`
      : message || 'Failed to create budget';
    throw new Error(errorMsg);
  }
}

/**
 * Get all budgets for current user, ordered by month descending
 * GET /api/budgets
 *
 * @returns Array of BudgetResponse
 *
 * Requirements from Story 3.2:
 * - Requires JWT authentication (handled by axios interceptor)
 * - Returns only budgets owned by authenticated user
 * - Ordered by month descending (newest first)
 */
export async function getBudgets(): Promise<BudgetResponse[]> {
  try {
    const response = await apiClient.get<ApiResponse<BudgetResponse[]>>(
      '/api/budgets'
    );

    if (!response.data.success) {
      const errorMsg = (response.data.data as any)?.message || 'Unknown error';
      throw new Error(`Failed to fetch budgets: ${errorMsg}`);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Get budgets error:', error);
    throw new Error(
      error.response?.data?.data?.message ||
      error.message ||
      'Failed to fetch budgets'
    );
  }
}

/**
 * Get budget for current month
 * GET /api/budgets/current
 *
 * @returns BudgetResponse for current month, or null if no budget set
 *
 * Requirements from Story 3.2:
 * - Requires JWT authentication (handled by axios interceptor)
 * - Returns budget for first day of current month
 * - Returns null if no budget found (expected case)
 * - Throws error on other failures (network, auth, etc.)
 */
export async function getCurrentBudget(): Promise<BudgetResponse | null> {
  try {
    const response = await apiClient.get<ApiResponse<BudgetResponse>>(
      '/api/budgets/current'
    );

    if (!response.data.success) {
      const errorMsg = (response.data.data as any)?.message || 'Unknown error';
      throw new Error(`Failed to fetch current budget: ${errorMsg}`);
    }

    return response.data.data;
  } catch (error: any) {
    // 404 is expected if no budget set - return null
    if (error.response?.status === 404) {
      return null;
    }

    console.error('Get current budget error:', error);
    throw new Error(
      error.response?.data?.data?.message ||
      error.message ||
      'Failed to fetch current budget'
    );
  }
}
