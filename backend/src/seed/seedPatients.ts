import { getDatabaseAdapter } from '../storage/DatabaseService.js';
import { Patient } from '../../../shared/types/index.js';

export async function seedPatients() {
  const dbPatients = getDatabaseAdapter<Patient>('patients');

  // Fix N+1 Query: In this specific case, we are inserting, not querying.
  // We can insert concurrently to make it faster instead of sequential awaiting.

  const patientsToInsert = [];
  for (let i = 1; i <= 5; i++) {
    patientsToInsert.push({
      id: `patient-${i}`,
      firstName: `Patient`,
      lastName: `${i}`,
      dateOfBirth: '1990-01-01',
      phone: `555-000${i}`,
      email: `patient${i}@test.com`,
      medicalHistory: {},
      createdAt: new Date().toISOString()
    });
  }

  await Promise.all(patientsToInsert.map(p => dbPatients.insert(p)));

  console.log('Seeded patients.');
}
