/**
 * IndexedDB Service Layer
 * Provides CRUD operations for offline expense storage
 */

import { initializeDatabase } from './schema';
import { OfflineExpense, IndexedDBError } from './types';

/**
 * Get database instance (singleton pattern)
 */
export async function getDB(): Promise<IDBDatabase> {
  return initializeDatabase();
}

/**
 * Create a new expense in IndexedDB
 * Generates temporary UUID for offline-created expenses
 */
export async function createExpense(
  expense: Omit<OfflineExpense, 'id' | 'createdAt'>
): Promise<OfflineExpense> {
  try {
    const db = await getDB();

    const newExpense: OfflineExpense = {
      ...expense,
      id: crypto.randomUUID(), // Generate temporary UUID (RFC 4122 v4)
      createdAt: new Date().toISOString(), // ISO 8601 UTC timestamp with Z suffix
    };

    const transaction = db.transaction('expenses', 'readwrite');
    const store = transaction.objectStore('expenses');

    return new Promise((resolve, reject) => {
      const request = store.add(newExpense);

      request.onsuccess = () => {
        console.log('[IndexedDB] Expense created:', newExpense.id);
        resolve(newExpense);
      };

      request.onerror = () => {
        const error = request.error as IndexedDBError;

        // Handle quota exceeded error
        if (error?.name === 'QuotaExceededError') {
          error.quotaExceeded = true;
          error.code = 'QUOTA_EXCEEDED';
        }

        console.error('[IndexedDB] Failed to create expense:', error);
        reject(error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in createExpense:', error);
    throw error;
  }
}

/**
 * Get all expenses for a specific user
 */
export async function getExpenses(userId: string): Promise<OfflineExpense[]> {
  try {
    const db = await getDB();

    const transaction = db.transaction('expenses', 'readonly');
    const store = transaction.objectStore('expenses');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const expenses = request.result as OfflineExpense[];
        console.log(`[IndexedDB] Retrieved ${expenses.length} expenses for user ${userId}`);
        resolve(expenses);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to get expenses:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in getExpenses:', error);
    throw error;
  }
}

/**
 * Get expenses for a specific date
 */
export async function getExpensesByDate(
  userId: string,
  date: string
): Promise<OfflineExpense[]> {
  try {
    const db = await getDB();

    const transaction = db.transaction('expenses', 'readonly');
    const store = transaction.objectStore('expenses');
    const index = store.index('date');

    return new Promise((resolve, reject) => {
      const request = index.getAll(date);

      request.onsuccess = () => {
        const allExpenses = request.result as OfflineExpense[];
        // Filter by userId since index is on date only
        const userExpenses = allExpenses.filter((e) => e.userId === userId);

        console.log(
          `[IndexedDB] Retrieved ${userExpenses.length} expenses for user ${userId} on ${date}`
        );
        resolve(userExpenses);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to get expenses by date:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in getExpensesByDate:', error);
    throw error;
  }
}

/**
 * Get all expenses pending sync (for sync queue)
 */
export async function getPendingSyncExpenses(
  userId: string
): Promise<OfflineExpense[]> {
  try {
    const db = await getDB();

    const transaction = db.transaction('expenses', 'readonly');
    const store = transaction.objectStore('expenses');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const allExpenses = request.result as OfflineExpense[];
        // Filter by userId and pending_sync
        const userPending = allExpenses.filter(
          (e) => e.userId === userId && e.pending_sync === true
        );

        console.log(
          `[IndexedDB] Retrieved ${userPending.length} pending sync expenses for user ${userId}`
        );
        resolve(userPending);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to get pending sync expenses:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in getPendingSyncExpenses:', error);
    throw error;
  }
}

/**
 * Update an expense (used for sync ID mapping and status updates)
 */
export async function updateExpense(
  id: string,
  updates: Partial<OfflineExpense>
): Promise<OfflineExpense> {
  try {
    const db = await getDB();

    const transaction = db.transaction('expenses', 'readwrite');
    const store = transaction.objectStore('expenses');

    return new Promise((resolve, reject) => {
      // First get the existing expense
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingExpense = getRequest.result as OfflineExpense;

        if (!existingExpense) {
          reject(new Error(`Expense not found: ${id}`));
          return;
        }

        const updatedExpense: OfflineExpense = {
          ...existingExpense,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        // Delete old record if ID changed (sync case)
        if (updates.id && updates.id !== id) {
          store.delete(id);
        }

        // Put updated record
        const putRequest = store.put(updatedExpense);

        putRequest.onsuccess = () => {
          console.log('[IndexedDB] Expense updated:', updatedExpense.id);
          resolve(updatedExpense);
        };

        putRequest.onerror = () => {
          console.error('[IndexedDB] Failed to update expense:', putRequest.error);
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('[IndexedDB] Failed to get expense for update:', getRequest.error);
        reject(getRequest.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in updateExpense:', error);
    throw error;
  }
}

/**
 * Delete an expense by ID
 */
export async function deleteExpense(id: string): Promise<void> {
  try {
    const db = await getDB();

    const transaction = db.transaction('expenses', 'readwrite');
    const store = transaction.objectStore('expenses');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[IndexedDB] Expense deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to delete expense:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in deleteExpense:', error);
    throw error;
  }
}
