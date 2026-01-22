import { useMemo } from 'react';
import { Expense } from '../types';

export interface ExpenseGroup {
  date: string; // ISO date string (YYYY-MM-DD)
  expenses: Expense[];
  total: number;
}

/**
 * Groups expenses by day and sorts them appropriately
 * @param expenses - Array of expenses to group, can be undefined
 * @returns Array of expense groups sorted by date DESC (newest first)
 */
export function useExpensesGroupedByDay(expenses: Expense[] | undefined): ExpenseGroup[] {
  return useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [];
    }

    // Group expenses by date
    const grouped = expenses.reduce((groups, expense) => {
      // Extract date portion from ISO string to avoid timezone conversion
      // '2026-01-21T09:30:00Z' -> '2026-01-21'
      const dateKey = expense.date.split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
      return groups;
    }, {} as Record<string, Expense[]>);

    // Convert to array and sort
    const groupedArray = Object.entries(grouped)
      .map(([date, groupExpenses]) => {
        // Sort expenses within group by createdAt DESC (newest first)
        const sortedExpenses = [...groupExpenses].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // DESC
        });

        // Calculate total for the group
        const total = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        return {
          date,
          expenses: sortedExpenses,
          total,
        };
      })
      // Sort groups by date DESC (newest first)
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // DESC
      });

    return groupedArray;
  }, [expenses]);
}
