export const DB_NAME = 'daily-expenses-db';
export const DB_VERSION = 1;

/**
 * Initialize IndexedDB database with expenses and sync_queue object stores
 * @returns Promise<IDBDatabase> The initialized database instance
 */
export function initializeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create expenses object store if it doesn't exist
      if (!db.objectStoreNames.contains('expenses')) {
        const expensesStore = db.createObjectStore('expenses', {
          keyPath: 'id',
        });

        // Create indexes for query optimization
        expensesStore.createIndex('date', 'date', { unique: false });
        expensesStore.createIndex('userId', 'userId', { unique: false });
        expensesStore.createIndex('pending_sync', 'pending_sync', {
          unique: false,
        });
      }

      // Create sync_queue object store if it doesn't exist
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };
  });
}
