import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { queueSyncRequest, getCachedData } from '../src/services/offlineStorage';
import axios from 'axios';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn().mockReturnValue({
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
      })
    }
  }
});
vi.mock('../src/services/offlineStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/offlineStorage')>();
  return {
    ...actual,
    queueSyncRequest: vi.fn(),
    cacheData: vi.fn(),
    getCachedData: vi.fn(),
  };
});
vi.mock('../src/services/appwrite', () => ({
  isAppwriteEnabled: false,
}));

import { DataService } from '../src/services/api';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    service = new DataService('/api/test');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create (POST)', () => {
    it('creates via network when online', async () => {
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      try {
        await service.create({ q: 1 });
      } catch(e) {}

      expect(queueSyncRequest).not.toHaveBeenCalled();

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    });

    it('queues request when offline', async () => {
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const res = await service.create({ q: 1 });

      expect(queueSyncRequest).toHaveBeenCalledWith('/api/test', 'POST', { q: 1 });
      expect(res._queued).toBe(true);

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    });
  });

  describe('update (PUT)', () => {
    it('queues request when offline', async () => {
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const res = await service.update('123', { q: 1 });

      expect(queueSyncRequest).toHaveBeenCalledWith('/api/test/123', 'PUT', { q: 1 });
      expect(res._queued).toBe(true);

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    });
  });

  describe('getAll (GET)', () => {
    it('falls back to cache when offline', async () => {
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      (getCachedData as any).mockResolvedValue([{ id: 'cached-1' }]);

      const res = await service.getAll();

      expect(getCachedData).toHaveBeenCalled();
      expect(res).toEqual([{ id: 'cached-1' }]);

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    });
  });
});
