import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { queueSyncRequest, getSyncQueue, clearSyncQueueItem, syncQueue, initDB } from '../src/services/offlineSyncService';
import axios from 'axios';

vi.mock('axios');

describe('OfflineSyncService', () => {
  beforeEach(async () => {
    const db = await initDB();
    const tx = db.transaction('sync-queue', 'readwrite');
    await tx.objectStore('sync-queue').clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('queue operations', () => {
    it('should queue offline writes and increase size', async () => {
      // Set to offline
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      await queueSyncRequest('/api/test', 'POST', { q: 1 });
      await queueSyncRequest('/api/test', 'POST', { q: 2 });

      const items = await getSyncQueue();
      expect(items.length).toBe(2);

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    });
  });

  describe('flush queue', () => {
    it('should flush when online and remove successful writes', async () => {
      await queueSyncRequest('/api/test', 'POST', { q: 1 });
      await queueSyncRequest('/api/test', 'POST', { q: 2 });

      let items = await getSyncQueue();
      expect(items.length).toBe(2);

      // Mock successful axios requests
      (axios as any).mockResolvedValue({ status: 200 });

      await syncQueue();

      items = await getSyncQueue();
      expect(items.length).toBe(0);
    });

    it('should mark failed writes for retry (keep in queue) for 500 errors', async () => {
      await queueSyncRequest('/api/test', 'POST', { q: 1 });
      let items = await getSyncQueue();
      expect(items.length).toBe(1);

      // Mock 500 failure
      (axios as any).mockRejectedValue({ response: { status: 500 } });

      await syncQueue();

      items = await getSyncQueue();
      expect(items.length).toBe(1); // Kept in queue for retry
    });

    it('should clear validation errors (4xx) from queue permanently', async () => {
      await queueSyncRequest('/api/test', 'POST', { q: 1 });
      let items = await getSyncQueue();
      expect(items.length).toBe(1);

      // Mock 400 failure
      (axios as any).mockRejectedValue({ response: { status: 400 } });

      await syncQueue();

      items = await getSyncQueue();
      expect(items.length).toBe(0); // Cleared because it is a bad request
    });
  });

  describe('concurrency', () => {
    it('uses Promise.allSettled: one failure does not block others', async () => {
      await queueSyncRequest('/api/test', 'POST', { q: 1 });
      await queueSyncRequest('/api/test', 'POST', { q: 2 });

      let callCount = 0;
      (axios as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject({ response: { status: 500 } }); // First fails
        }
        return Promise.resolve({ status: 200 }); // Second succeeds
      });

      await syncQueue();

      const items = await getSyncQueue();
      expect(items.length).toBe(1); // Only the failed one remains
      expect(items[0].body.q).toBe(1);
    });
  });
});
