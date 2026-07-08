import { StorageAdapter } from './StorageAdapter.js';
import { LocalJsonAdapter } from './adapters/LocalJsonAdapter.js';
import { SqliteAdapter } from './adapters/SqliteAdapter.js';
import { AppwriteAdapter } from './adapters/AppwriteAdapter.js';
import { getEnv } from '../utils/env.js';

export type { StorageAdapter };

export function getDatabaseAdapter<T extends { id: string }>(collectionName: string): StorageAdapter<T> {
  const env = getEnv();
  const mode = env.STORAGE_ADAPTER;

  if (mode === 'appwrite') {
    return new AppwriteAdapter<T>(collectionName);
  }

  if (mode === 'local-json') {
     return new LocalJsonAdapter<T>(`${collectionName}.json`);
  }

  // Default: SQLite-backed local storage
  return new SqliteAdapter<T>(collectionName);
}
