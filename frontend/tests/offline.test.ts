import { describe, it, expect, beforeEach } from 'vitest';
<<<<<<< HEAD
import { initDB, cacheData, getCachedData, queueSyncRequest, getSyncQueue, clearSyncQueueItem } from '../src/services/offlineStorage.ts';
=======
import 'fake-indexeddb/auto';
import { queueSyncRequest, getSyncQueue, clearSyncQueueItem, initDB } from '../src/services/offlineStorage';
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3

describe('Offline Storage Cache', () => {
  beforeEach(async () => {
    const db = await initDB();
<<<<<<< HEAD
    const tx = db.transaction('cached-data', 'readwrite');
    await tx.objectStore('cached-data').clear();
  });

  it('should cache and retrieve data', async () => {
    await cacheData('test_key', { hello: 'world' });
    const result = await getCachedData('test_key');
    expect(result).toEqual({ hello: 'world' });
  });

  it('should return null for missing cache key', async () => {
    const result = await getCachedData('nonexistent');
    expect(result).toBeNull();
  });
});

describe('Offline Sync Queue', () => {
  beforeEach(async () => {
    const db = await initDB();
    const tx = db.transaction('sync-queue', 'readwrite');
    await tx.objectStore('sync-queue').clear();
  });

  it('should queue a sync request and retrieve it', async () => {
    await queueSyncRequest('/api/test', 'POST', { foo: 'bar' });
    const queue = await getSyncQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].url).toBe('/api/test');
    expect(queue[0].method).toBe('POST');
    expect(queue[0].body).toEqual({ foo: 'bar' });
  });

  it('should clear a queued item by id', async () => {
    await queueSyncRequest('/api/test', 'POST', {});
    let queue = await getSyncQueue();
    expect(queue.length).toBe(1);

    if (queue[0].id !== undefined) {
      await clearSyncQueueItem(queue[0].id);
    }
    queue = await getSyncQueue();
    expect(queue.length).toBe(0);
=======
    const tx = db.transaction('sync-queue', 'readwrite');
    await tx.objectStore('sync-queue').clear();
  });

  it('should queue a sync request and retrieve it', async () => {
    const payload = { templateId: '123', answers: { q1: 'yes' } };
    await queueSyncRequest('/api/test', 'POST', payload);

    const queuedItems = await getSyncQueue();
    expect(queuedItems.length).toBe(1);
    expect(queuedItems[0].url).toContain('/api/test');
    expect(queuedItems[0].method).toBe('POST');
    expect(queuedItems[0].body).toEqual(payload);
  });

  it('should remove a sync item', async () => {
    await queueSyncRequest('/api/test', 'POST', { q: 1 });
    let queuedItems = await getSyncQueue();
    expect(queuedItems.length).toBe(1);

    const itemId = queuedItems[0].id!;
    await clearSyncQueueItem(itemId);

    queuedItems = await getSyncQueue();
    expect(queuedItems.length).toBe(0);
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3
  });
});
