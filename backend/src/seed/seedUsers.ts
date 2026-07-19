import bcrypt from 'bcrypt';
import { getDatabaseAdapter } from '../storage/DatabaseService.js';
import { User } from '../../../shared/types/index.js';

export async function seedUsers() {
  const dbUsers = getDatabaseAdapter<User>('users');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  await dbUsers.insert({ id: 'user_admin', email: 'admin@dentpro.com', passwordHash, role: 'ADMIN', name: 'Dr. Arthur Vance', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'user_reception', email: 'reception@dentpro.com', passwordHash, role: 'RECEPTION', name: 'Clara Oswald', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'user_dentist_1', email: 'dentist1@dentpro.com', passwordHash, role: 'DENTIST', name: 'Dr. Sarah Carter', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'user_dentist_2', email: 'dentist2@dentpro.com', passwordHash, role: 'DENTIST', name: 'Dr. Marcus Vance', createdAt: new Date().toISOString() });
  await dbUsers.insert({ id: 'user_patient', email: 'patient@dentpro.com', passwordHash, role: 'PATIENT', name: 'John Doe', createdAt: new Date().toISOString() });

  console.log('Seeded users.');
}
