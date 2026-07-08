import bcrypt from 'bcrypt';
import { getDatabaseAdapter } from '../storage/DatabaseService.js';
import { User } from '../../../shared/types/index.js';

export async function seedUsers() {
  const dbUsers = getDatabaseAdapter<User>('users');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  await dbUsers.insert({ id: 'admin-1', email: 'admin@clinic.com', passwordHash, role: 'ADMIN', name: 'Admin Alice', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'reception-1', email: 'reception@clinic.com', passwordHash, role: 'RECEPTION', name: 'Rec Rachel', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'dentist-1', email: 'dentist1@clinic.com', passwordHash, role: 'DENTIST', name: 'Dr. Smile', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'dentist-2', email: 'dentist2@clinic.com', passwordHash, role: 'DENTIST', name: 'Dr. Drill', createdAt: new Date().toISOString() });

  console.log('Seeded users.');
}
