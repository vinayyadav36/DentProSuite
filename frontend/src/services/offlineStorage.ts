import { initDB } from './offlineSyncService';

// ------------------------------------------------------------------
// Caching Layer (Read Offline)
// ------------------------------------------------------------------
export async function cacheData(key: string, data: any) {
  const db = await initDB();
  await db.put('cached-data', { id: key, data, updated_at: Date.now() });
}

export async function getCachedData(key: string) {
  const db = await initDB();
  const entry = await db.get('cached-data', key);
  return entry ? entry.data : null;
}

// Re-export sync functionality so we don't break existing imports
export { queueSyncRequest, getSyncQueue, clearSyncQueueItem, syncQueue, initDB } from './offlineSyncService';
