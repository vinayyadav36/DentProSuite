import { openDB } from 'idb';
import type { FormSubmission } from '../../../shared/types/index.js';

const DB_NAME = 'dentist-pwa-db';
const STORE_NAME = 'offline-submissions';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export async function saveOfflineSubmission(submission: FormSubmission) {
  const db = await initDB();
  await db.add(STORE_NAME, submission);
}

export async function getOfflineSubmissions() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function removeOfflineSubmission(id: number | string) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function syncOfflineSubmissions() {
  const submissions = await getOfflineSubmissions();
  if (submissions.length === 0) return;

  for (const sub of submissions) {
    try {
      const res = await fetch('http://localhost:3001/api/forms/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      if (res.ok) {
        await removeOfflineSubmission(sub.id as string);
      }
    } catch (err) {
      break;
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineSubmissions);
}
