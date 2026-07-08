import bcrypt from 'bcrypt';
import { getDatabaseAdapter } from '../storage/DatabaseService.js';
import { User, Clinic } from '../../../shared/types/index.js';

export async function seedUsers() {
  const dbUsers = getDatabaseAdapter<User>('users');
  const dbClinics = getDatabaseAdapter<Clinic>('clinics');

  // Password hashing
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Clinic
  await dbClinics.insert({
    id: 'clinic-1',
    name: 'DentistPro360 Demo Clinic',
    address: '123 Fake St, Springfield',
    chairs: 3,
    operatingHours: { start: '08:00', end: '18:00' }
  });

  // 2. Users (1 Admin, 2 Dentists, 1 Receptionist)
  await dbUsers.insert({ id: 'admin-1', email: 'admin@clinic.com', passwordHash, role: 'ADMIN', name: 'Admin Alice', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'reception-1', email: 'reception@clinic.com', passwordHash, role: 'RECEPTION', name: 'Rec Rachel', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'dentist-1', email: 'dentist1@clinic.com', passwordHash, role: 'DENTIST', name: 'Dr. Smile', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'dentist-2', email: 'dentist2@clinic.com', passwordHash, role: 'DENTIST', name: 'Dr. Drill', createdAt: new Date().toISOString() });

  console.log('Seeded users and clinic.');
}
