import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase, DB_NAME, DB_VERSION } from './schema';

describe('IndexedDB Schema', () => {
  beforeEach(async () => {
    // Clean up any existing database before each test
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

  it('should create database with correct name and version', async () => {
    const db = await initializeDatabase();

    expect(db.name).toBe(DB_NAME);
    expect(db.version).toBe(DB_VERSION);

    db.close();
  });

  it('should create expenses object store with correct configuration', async () => {
    const db = await initializeDatabase();

    expect(db.objectStoreNames.contains('expenses')).toBe(true);

    const transaction = db.transaction('expenses', 'readonly');
    const store = transaction.objectStore('expenses');

    expect(store.keyPath).toBe('id');

    db.close();
  });

  it('should create sync_queue object store', async () => {
    const db = await initializeDatabase();

    expect(db.objectStoreNames.contains('sync_queue')).toBe(true);

    db.close();
  });

  it('should create required indexes on expenses object store', async () => {
    const db = await initializeDatabase();

    const transaction = db.transaction('expenses', 'readonly');
    const store = transaction.objectStore('expenses');

    expect(store.indexNames.contains('date')).toBe(true);
    expect(store.indexNames.contains('userId')).toBe(true);
    expect(store.indexNames.contains('pending_sync')).toBe(true);

    db.close();
  });

  it('should handle database upgrade correctly', async () => {
    // First initialization
    const db1 = await initializeDatabase();
    db1.close();

    // Second initialization should reuse existing database
    const db2 = await initializeDatabase();

    expect(db2.name).toBe(DB_NAME);
    expect(db2.version).toBe(DB_VERSION);

    db2.close();
  });
});
