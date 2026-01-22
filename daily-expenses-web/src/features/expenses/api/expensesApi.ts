// API client functions for Expense endpoints
// Follows Story 2.2 API implementation: POST /api/expenses

import { apiClient } from '../../../services/api/apiClient.ts';
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseResponse,
  ApiResponse,
} from '../types/expense.types';

/**
 * Create a new expense
 * POST /api/expenses
 * 
 * @param data - Expense data (amount, note, date)
 * @returns ExpenseResponse with server-generated ID and timestamps
 * 
 * Requirements from Story 2.2:
 * - Requires JWT authentication (handled by axios interceptor)
 * - Amount > 0 validated on backend
 * - Note is HTML-encoded on backend to prevent XSS
 * - Date defaults to today if not provided
 */
export async function createExpense(
  data: CreateExpenseDto
): Promise<ExpenseResponse> {
  try {
    const response = await apiClient.post<ApiResponse<ExpenseResponse>>(
      '/api/expenses',
      {
        amount: data.amount,
        note: data.note || null,
        date: data.date,
      }
    );

    if (!response.data.success) {
      const errorMsg = response.data.data?.message || 'Unknown error';
      throw new Error(`Failed to create expense: ${errorMsg}`);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Create expense error:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create expense'
    );
  }
}

/**
 * Get all expenses for current user
 * GET /api/expenses
 * 
 * @returns Array of ExpenseResponse
 */
export async function getExpenses(): Promise<ExpenseResponse[]> {
  try {
    const response = await apiClient.get<ApiResponse<ExpenseResponse[]>>(
      '/api/expenses'
    );

    if (!response.data.success) {
      const errorMsg = response.data.data?.message || 'Unknown error';
      throw new Error(`Failed to fetch expenses: ${errorMsg}`);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Get expenses error:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch expenses'
    );
  }
}

/**
 * Update an existing expense
 * PUT /api/expenses/{id}
 * 
 * @param id - Expense ID to update
 * @param data - Updated expense data (amount, note, date)
 * @returns Updated ExpenseResponse with new timestamp
 * 
 * Requirements from Story 2.8:
 * - Requires JWT authentication (handled by axios interceptor)
 * - Only owner can update (403 Forbidden if not owner)
 * - Amount > 0 validated on backend
 * - Note is HTML-encoded on backend to prevent XSS
 * - UpdatedAt timestamp is updated on server
 */
export async function updateExpense(
  id: string,
  data: UpdateExpenseDto
): Promise<ExpenseResponse> {
  try {
    const response = await apiClient.put<ApiResponse<ExpenseResponse>>(
      `/api/expenses/${id}`,
      {
        amount: data.amount,
        note: data.note || null,
        date: data.date,
      }
    );

    if (!response.data.success) {
      const errorMsg = response.data.data?.message || 'Unknown error';
      throw new Error(`Failed to update expense: ${errorMsg}`);
    }

    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('Update expense error:', error);
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Failed to update expense'
    );
  }
}

/**
 * Delete an expense by ID
 * DELETE /api/expenses/{id}
 *
 * @param id - Expense ID to delete
 * @returns Promise<void> - No content returned on success
 *
 * Requirements from Story 2.9:
 * - Requires JWT authentication (handled by axios interceptor)
 * - Only owner can delete (403 Forbidden if not owner)
 * - Returns 404 if expense not found
 */
export async function deleteExpense(id: string): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<{ message: string; deletedId: string }>>(
      `/api/expenses/${id}`
    );

    if (!response.data.success) {
      const errorMsg = response.data.data?.message || 'Unknown error';
      throw new Error(`Failed to delete expense: ${errorMsg}`);
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('Delete expense error:', error);
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Failed to delete expense'
    );
  }
}
