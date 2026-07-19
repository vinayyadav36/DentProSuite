import { getDatabaseAdapter } from '../storage/DatabaseService.js';

export async function seedPatients() {
  const dbPatients = getDatabaseAdapter<any>('patients');

  const patients = [
    {
      id: 'pat_1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@dentpro.com',
      phone: '+1 (555) 304-4501',
      dob: '1988-11-24',
      gender: 'Male',
      address: '742 Evergreen Terrace, Springfield, OR',
      medicalHistory: ['Penicillin Allergy', 'Mild Hypertension'],
      emergencyContact: 'Jane Doe (+1 (555) 304-4502)',
      notes: 'Slight anxiety regarding root-canals. Prefers early morning appointments.',
      createdAt: '2026-01-10'
    },
    {
      id: 'pat_2',
      firstName: 'Emily',
      lastName: 'Smith',
      email: 'emily.smith@example.com',
      phone: '+1 (555) 789-1234',
      dob: '1995-04-12',
      gender: 'Female',
      address: '128 Birch Road, Portland, OR',
      medicalHistory: [],
      emergencyContact: 'David Smith (+1 (555) 789-9876)',
      notes: 'Completed teeth whitening last month. Very pleased with results.',
      createdAt: '2026-03-22'
    },
    {
      id: 'pat_3',
      firstName: 'Robert',
      lastName: 'Chen',
      email: 'robert.chen@example.com',
      phone: '+1 (555) 456-7890',
      dob: '1975-08-03',
      gender: 'Male',
      address: '56 Pearl St, Apt 4B, Beaverton, OR',
      medicalHistory: ['Type 2 Diabetes', 'Takes Metformin'],
      emergencyContact: 'Lisa Chen (+1 (555) 456-1122)',
      notes: 'Monitor gum health closely due to diabetic history.',
      createdAt: '2026-04-15'
    },
    {
      id: 'pat_4',
      firstName: 'Sophia',
      lastName: 'Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (555) 234-5678',
      dob: '2001-02-14',
      gender: 'Female',
      address: '904 Oak Ave, Hillsboro, OR',
      medicalHistory: ['Asthma (uses Albuterol inhaler)'],
      emergencyContact: 'Maria Martinez (+1 (555) 234-8899)',
      notes: 'Sensitive teeth. Prefers non-fluoride varnish options.',
      createdAt: '2026-05-19'
    }
  ];

  await Promise.all(patients.map(p => dbPatients.insert(p)));
  console.log('Seeded patients.');
}
