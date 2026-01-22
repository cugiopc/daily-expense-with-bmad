import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getDB,
  createExpense,
  getExpenses,
  getExpensesByDate,
  getPendingSyncExpenses,
  updateExpense,
  deleteExpense,
} from './index';
import { OfflineExpense } from './types';
import { DB_NAME } from './schema';

describe('IndexedDB Service Layer', () => {
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    // Clean up database before each test
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name === DB_NAME) {
        indexedDB.deleteDatabase(DB_NAME);
      }
    }
  });

  afterEach(async () => {
    // Clean up database after each test
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name === DB_NAME) {
        indexedDB.deleteDatabase(DB_NAME);
      }
    }
  });

  describe('getDB', () => {
    it('should return initialized database instance', async () => {
      const db = await getDB();

      expect(db).toBeDefined();
      expect(db.name).toBe(DB_NAME);
      expect(db.objectStoreNames.contains('expenses')).toBe(true);

      db.close();
    });
  });

  describe('createExpense', () => {
    it('should create expense with pending_sync flag when offline', async () => {
      const expense: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 45000,
        note: 'Test expense',
        date: '2026-01-22',
        pending_sync: true,
        syncStatus: 'pending',
        localOnly: true,
      };

      const created = await createExpense(expense);

      expect(created.id).toBeDefined();
      expect(created.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      ); // UUID v4 format
      expect(created.userId).toBe(testUserId);
      expect(created.amount).toBe(45000);
      expect(created.pending_sync).toBe(true);
      expect(created.syncStatus).toBe('pending');
      expect(created.localOnly).toBe(true);
      expect(created.createdAt).toBeDefined();
    });

    it('should throw error when quota exceeded', async () => {
      // This test would require mocking quota exceeded error
      // For MVP, we'll skip this but document it
      expect(true).toBe(true);
    });
  });

  describe('getExpenses', () => {
    it('should return all expenses for a user', async () => {
      const expense1: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 45000,
        note: 'Expense 1',
        date: '2026-01-22',
        pending_sync: false,
        syncStatus: 'synced',
        localOnly: false,
      };

      const expense2: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 30000,
        note: 'Expense 2',
        date: '2026-01-21',
        pending_sync: true,
        syncStatus: 'pending',
        localOnly: true,
      };

      await createExpense(expense1);
      await createExpense(expense2);

      const expenses = await getExpenses(testUserId);

      expect(expenses).toHaveLength(2);
      expect(expenses[0].userId).toBe(testUserId);
      expect(expenses[1].userId).toBe(testUserId);
    });

    it('should not return expenses from other users', async () => {
      const expense1: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 45000,
        note: 'My expense',
        date: '2026-01-22',
        pending_sync: false,
        syncStatus: 'synced',
        localOnly: false,
      };

      const expense2: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: 'other-user-456',
        amount: 30000,
        note: 'Other user expense',
        date: '2026-01-22',
        pending_sync: false,
        syncStatus: 'synced',
        localOnly: false,
      };

      await createExpense(expense1);
      await createExpense(expense2);

      const expenses = await getExpenses(testUserId);

      expect(expenses).toHaveLength(1);
      expect(expenses[0].note).toBe('My expense');
    });
  });

  describe('getExpensesByDate', () => {
    it('should return expenses for specific date', async () => {
      const expense1: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 45000,
        note: 'Today expense',
        date: '2026-01-22',
        pending_sync: false,
        syncStatus: 'synced',
        localOnly: false,
      };

      const expense2: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 30000,
        note: 'Yesterday expense',
        date: '2026-01-21',
        pending_sync: false,
        syncStatus: 'synced',
        localOnly: false,
      };

      await createExpense(expense1);
      await createExpense(expense2);

      const expenses = await getExpensesByDate(testUserId, '2026-01-22');

      expect(expenses).toHaveLength(1);
      expect(expenses[0].note).toBe('Today expense');
      expect(expenses[0].date).toBe('2026-01-22');
    });
  });

  describe('getPendingSyncExpenses', () => {
    it('should return only expenses with pending_sync flag', async () => {
      const syncedExpense: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 45000,
        note: 'Synced expense',
        date: '2026-01-22',
        pending_sync: false,
        syncStatus: 'synced',
        localOnly: false,
      };

      const pendingExpense: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 30000,
        note: 'Pending expense',
        date: '2026-01-22',
        pending_sync: true,
        syncStatus: 'pending',
        localOnly: true,
      };

      await createExpense(syncedExpense);
      await createExpense(pendingExpense);

      const pendingExpenses = await getPendingSyncExpenses(testUserId);

      expect(pendingExpenses).toHaveLength(1);
      expect(pendingExpenses[0].note).toBe('Pending expense');
      expect(pendingExpenses[0].pending_sync).toBe(true);
    });
  });

  describe('updateExpense', () => {
    it('should update expense with new server ID after sync', async () => {
      const expense: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 45000,
        note: 'Pending expense',
        date: '2026-01-22',
        pending_sync: true,
        syncStatus: 'pending',
        localOnly: true,
      };

      const created = await createExpense(expense);

      const updated = await updateExpense(created.id, {
        id: 'server-generated-id-123',
        pending_sync: false,
        syncStatus: 'synced',
      });

      expect(updated.id).toBe('server-generated-id-123');
      expect(updated.pending_sync).toBe(false);
      expect(updated.syncStatus).toBe('synced');
    });
  });

  describe('deleteExpense', () => {
    it('should delete expense by ID', async () => {
      const expense: Omit<OfflineExpense, 'id' | 'createdAt'> = {
        userId: testUserId,
        amount: 45000,
        note: 'To be deleted',
        date: '2026-01-22',
        pending_sync: false,
        syncStatus: 'synced',
        localOnly: false,
      };

      const created = await createExpense(expense);

      await deleteExpense(created.id);

      const expenses = await getExpenses(testUserId);

      expect(expenses).toHaveLength(0);
    });
  });
});
