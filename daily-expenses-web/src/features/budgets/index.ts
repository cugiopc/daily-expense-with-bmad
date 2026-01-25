/**
 * Budgets feature public API
 * Story 3.2: Set Monthly Budget API and UI
 *
 * Exports all public components, hooks, and types for the budgets feature
 */

// Components
export { BudgetForm } from './components/BudgetForm';
export { BudgetDisplay } from './components/BudgetDisplay';
export { BudgetProgress } from './components/BudgetProgress';
export { DailyAverage } from './components/DailyAverage';
export { MonthEndProjection } from './components/MonthEndProjection';

// Hooks
export { useCreateBudget } from './hooks/useCreateBudget';
export { useBudgets } from './hooks/useBudgets';
export { useCurrentBudget } from './hooks/useCurrentBudget';

// Types
export type {
  CreateBudgetDto,
  BudgetResponse,
  Budget,
  ApiResponse,
} from './types/budget.types';
