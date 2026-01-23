// Unit tests for useRecentNotes hook
// Story 2.12: Recent Notes Quick Selection
// Tests cover: deduplication, ordering, empty filtering, refresh, fallback to TanStack Query

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useRecentNotes } from './useRecentNotes';
import * as indexedDB from '../../../services/indexeddb';
import * as jwtHelper from '../../../shared/utils/jwtHelper';

// Mock dependencies
vi.mock('../../../services/indexeddb');
vi.mock('../../../shared/utils/jwtHelper');

describe('useRecentNotes', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create fresh query client for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Mock getUserIdFromToken to return test user
    vi.mocked(jwtHelper.getUserIdFromToken).mockReturnValue('test-user-id');
  });

  // Helper to render hook with providers
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };

  it('should return top 5 unique notes ordered by date (newest first)', async () => {
    const mockExpenses = [
      { id: '1', note: 'cafe', createdAt: '2026-01-23T10:00:00Z', amount: 50000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T10:00:00Z' },
      { id: '2', note: 'lunch', createdAt: '2026-01-23T12:00:00Z', amount: 80000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T12:00:00Z' },
      { id: '3', note: 'cafe', createdAt: '2026-01-22T09:00:00Z', amount: 50000, userId: 'test-user-id', date: '2026-01-22', updatedAt: '2026-01-22T09:00:00Z' }, // Duplicate
      { id: '4', note: 'dinner', createdAt: '2026-01-23T18:00:00Z', amount: 150000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T18:00:00Z' },
      { id: '5', note: 'grab', createdAt: '2026-01-23T08:00:00Z', amount: 45000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T08:00:00Z' },
      { id: '6', note: 'coffee', createdAt: '2026-01-21T10:00:00Z', amount: 55000, userId: 'test-user-id', date: '2026-01-21', updatedAt: '2026-01-21T10:00:00Z' },
      { id: '7', note: 'breakfast', createdAt: '2026-01-20T07:00:00Z', amount: 60000, userId: 'test-user-id', date: '2026-01-20', updatedAt: '2026-01-20T07:00:00Z' },
    ];

    vi.mocked(indexedDB.getExpenses).mockResolvedValue(mockExpenses as any);

    const { result } = renderHook(() => useRecentNotes(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should return top 5 unique notes, newest first
    expect(result.current.recentNotes).toEqual([
      'dinner',   // 2026-01-23T18:00:00Z (newest)
      'lunch',    // 2026-01-23T12:00:00Z
      'cafe',     // 2026-01-23T10:00:00Z (most recent of duplicates)
      'grab',     // 2026-01-23T08:00:00Z
      'coffee',   // 2026-01-21T10:00:00Z
      // 'breakfast' not included (limit 5)
    ]);
  });

  it('should filter out empty and whitespace notes', async () => {
    const mockExpenses = [
      { id: '1', note: 'cafe', createdAt: '2026-01-23T10:00:00Z', amount: 50000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T10:00:00Z' },
      { id: '2', note: '', createdAt: '2026-01-23T09:00:00Z', amount: 80000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T09:00:00Z' },
      { id: '3', note: '   ', createdAt: '2026-01-23T08:00:00Z', amount: 70000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T08:00:00Z' },
      { id: '4', note: 'lunch', createdAt: '2026-01-23T07:00:00Z', amount: 100000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T07:00:00Z' },
      { id: '5', note: null, createdAt: '2026-01-23T06:00:00Z', amount: 60000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T06:00:00Z' } as any,
    ];

    vi.mocked(indexedDB.getExpenses).mockResolvedValue(mockExpenses as any);

    const { result } = renderHook(() => useRecentNotes(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only include non-empty notes
    expect(result.current.recentNotes).toEqual(['cafe', 'lunch']);
  });

  it('should handle empty expense list gracefully', async () => {
    vi.mocked(indexedDB.getExpenses).mockResolvedValue([]);

    const { result } = renderHook(() => useRecentNotes(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recentNotes).toEqual([]);
  });

  it('should refresh when refresh() is called', async () => {
    const mockExpenses = [
      { id: '1', note: 'cafe', createdAt: '2026-01-23T10:00:00Z', amount: 50000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T10:00:00Z' },
    ];

    vi.mocked(indexedDB.getExpenses).mockResolvedValue(mockExpenses as any);

    const { result } = renderHook(() => useRecentNotes(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recentNotes).toEqual(['cafe']);

    // Add new expense
    const newExpenses = [
      ...mockExpenses,
      { id: '2', note: 'lunch', createdAt: '2026-01-23T12:00:00Z', amount: 80000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T12:00:00Z' },
    ];
    vi.mocked(indexedDB.getExpenses).mockResolvedValue(newExpenses as any);

    // Trigger refresh
    result.current.refresh();

    await waitFor(() => {
      expect(result.current.recentNotes).toEqual(['lunch', 'cafe']);
    });
  });

  it('should fall back to TanStack Query cache if IndexedDB is empty', async () => {
    // IndexedDB returns empty
    vi.mocked(indexedDB.getExpenses).mockResolvedValue([]);

    // Set cache data
    const cachedExpenses = [
      { id: '1', note: 'cafe', createdAt: '2026-01-23T10:00:00Z', amount: 50000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T10:00:00Z' },
      { id: '2', note: 'lunch', createdAt: '2026-01-23T12:00:00Z', amount: 80000, userId: 'test-user-id', date: '2026-01-23', updatedAt: '2026-01-23T12:00:00Z' },
    ];
    queryClient.setQueryData(['expenses'], cachedExpenses);

    const { result } = renderHook(() => useRecentNotes(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should use cached data
    expect(result.current.recentNotes).toEqual(['lunch', 'cafe']);
  });

  it('should return empty array when no userId available', async () => {
    // Mock getUserIdFromToken to return null (not authenticated)
    vi.mocked(jwtHelper.getUserIdFromToken).mockReturnValue(null);

    const { result } = renderHook(() => useRecentNotes(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recentNotes).toEqual([]);
  });

  it('should handle errors gracefully and return empty array', async () => {
    // Mock IndexedDB to throw error
    vi.mocked(indexedDB.getExpenses).mockRejectedValue(new Error('IndexedDB error'));

    const { result } = renderHook(() => useRecentNotes(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should handle error and return empty array
    expect(result.current.recentNotes).toEqual([]);
  });
});
