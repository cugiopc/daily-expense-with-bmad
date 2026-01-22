import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExpensesGroupedByDay } from './useExpensesGroupedByDay';
import { Expense } from '../types';

describe('useExpensesGroupedByDay', () => {
  it('should return empty array when expenses is undefined', () => {
    const { result } = renderHook(() => useExpensesGroupedByDay(undefined));
    expect(result.current).toEqual([]);
  });

  it('should return empty array when expenses is empty', () => {
    const { result } = renderHook(() => useExpensesGroupedByDay([]));
    expect(result.current).toEqual([]);
  });

  it('should group expenses by date', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        userId: 'user1',
        amount: 50000,
        note: 'Coffee',
        date: '2026-01-21T09:30:00Z',
        createdAt: '2026-01-21T09:30:00Z',
        updatedAt: '2026-01-21T09:30:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        amount: 75000,
        note: 'Lunch',
        date: '2026-01-21T12:00:00Z',
        createdAt: '2026-01-21T12:00:00Z',
        updatedAt: '2026-01-21T12:00:00Z',
      },
      {
        id: '3',
        userId: 'user1',
        amount: 100000,
        note: 'Dinner',
        date: '2026-01-20T19:00:00Z',
        createdAt: '2026-01-20T19:00:00Z',
        updatedAt: '2026-01-20T19:00:00Z',
      },
    ];

    const { result } = renderHook(() => useExpensesGroupedByDay(expenses));
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].date).toBe('2026-01-21');
    expect(result.current[0].expenses).toHaveLength(2);
    expect(result.current[1].date).toBe('2026-01-20');
    expect(result.current[1].expenses).toHaveLength(1);
  });

  it('should sort groups by date DESC (newest first)', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        userId: 'user1',
        amount: 100000,
        note: 'Old expense',
        date: '2026-01-15T10:00:00Z',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        amount: 50000,
        note: 'New expense',
        date: '2026-01-21T10:00:00Z',
        createdAt: '2026-01-21T10:00:00Z',
        updatedAt: '2026-01-21T10:00:00Z',
      },
    ];

    const { result } = renderHook(() => useExpensesGroupedByDay(expenses));
    
    expect(result.current[0].date).toBe('2026-01-21');
    expect(result.current[1].date).toBe('2026-01-15');
  });

  it('should sort expenses within group by createdAt DESC (newest first)', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        userId: 'user1',
        amount: 50000,
        note: 'First',
        date: '2026-01-21T09:00:00Z',
        createdAt: '2026-01-21T09:00:00Z',
        updatedAt: '2026-01-21T09:00:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        amount: 75000,
        note: 'Second',
        date: '2026-01-21T10:00:00Z',
        createdAt: '2026-01-21T10:00:00Z',
        updatedAt: '2026-01-21T10:00:00Z',
      },
      {
        id: '3',
        userId: 'user1',
        amount: 100000,
        note: 'Third',
        date: '2026-01-21T11:00:00Z',
        createdAt: '2026-01-21T11:00:00Z',
        updatedAt: '2026-01-21T11:00:00Z',
      },
    ];

    const { result } = renderHook(() => useExpensesGroupedByDay(expenses));
    
    expect(result.current[0].expenses[0].id).toBe('3'); // Newest
    expect(result.current[0].expenses[1].id).toBe('2');
    expect(result.current[0].expenses[2].id).toBe('1'); // Oldest
  });

  it('should calculate total for each group', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        userId: 'user1',
        amount: 50000,
        note: 'Coffee',
        date: '2026-01-21T09:30:00Z',
        createdAt: '2026-01-21T09:30:00Z',
        updatedAt: '2026-01-21T09:30:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        amount: 75000,
        note: 'Lunch',
        date: '2026-01-21T12:00:00Z',
        createdAt: '2026-01-21T12:00:00Z',
        updatedAt: '2026-01-21T12:00:00Z',
      },
    ];

    const { result } = renderHook(() => useExpensesGroupedByDay(expenses));
    
    expect(result.current[0].total).toBe(125000);
  });

  it('should handle expenses across month boundaries', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        userId: 'user1',
        amount: 50000,
        note: 'January expense',
        date: '2026-01-31T23:00:00Z',
        createdAt: '2026-01-31T23:00:00Z',
        updatedAt: '2026-01-31T23:00:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        amount: 75000,
        note: 'February expense',
        date: '2026-02-01T01:00:00Z',
        createdAt: '2026-02-01T01:00:00Z',
        updatedAt: '2026-02-01T01:00:00Z',
      },
    ];

    const { result } = renderHook(() => useExpensesGroupedByDay(expenses));
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].date).toBe('2026-02-01');
    expect(result.current[1].date).toBe('2026-01-31');
  });
});
