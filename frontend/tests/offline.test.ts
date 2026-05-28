import { describe, it, expect, beforeEach } from 'vitest';
import { saveOfflineSubmission, getOfflineSubmissions, removeOfflineSubmission, initDB } from '../src/services/offlineStorage.ts';

describe('Offline Storage Queue', () => {
  beforeEach(async () => {
    // Clear the idb object store before each test
    const db = await initDB();
    const tx = db.transaction('offline-submissions', 'readwrite');
    await tx.objectStore('offline-submissions').clear();
  });

  it('should save and retrieve a submission', async () => {
    const dummySubmission = {
      id: 'temp-1',
      templateId: 't-1',
      patientId: 'p-1',
      data: { a: 1 },
      submittedAt: new Date().toISOString()
    } as any;

    await saveOfflineSubmission(dummySubmission);
    const results = await getOfflineSubmissions();

    expect(results.length).toBe(1);
    expect(results[0].templateId).toBe('t-1');
  });

  it('should remove a submission', async () => {
    const dummySubmission = {
      id: 'temp-2',
      templateId: 't-2',
      patientId: 'p-2',
      data: {},
      submittedAt: new Date().toISOString()
    } as any;

    await saveOfflineSubmission(dummySubmission);
    let results = await getOfflineSubmissions();
    expect(results.length).toBe(1);

    await removeOfflineSubmission('temp-2');
    results = await getOfflineSubmissions();
    expect(results.length).toBe(0);
  });
});
