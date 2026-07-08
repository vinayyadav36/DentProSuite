import { seedUsers } from './seedUsers.js';
import { seedPatients } from './seedPatients.js';
import { seedForms } from './seedForms.js';
import { seedAppointments } from './seedAppointments.js';
import { seedBilling } from './seedBilling.js';

async function seed() {
  console.log('Seeding data...');

  await seedUsers();
  await seedPatients();
  await seedForms();
  await seedAppointments();
  await seedBilling();

  console.log('Seed data generated successfully.');
}

seed().catch(console.error);
