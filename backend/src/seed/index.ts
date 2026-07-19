import { seedClinics } from './seedClinics.js';
import { seedUsers } from './seedUsers.js';
import { seedPatients } from './seedPatients.js';
import { seedForms } from './seedForms.js';
import { seedAppointments } from './seedAppointments.js';
import { seedBilling } from './seedBilling.js';
import { seedServices } from './seedServices.js';
import { seedNotifications } from './seedNotifications.js';
import { seedSettings } from './seedSettings.js';

async function seed() {
  console.log('Seeding data...');

  await seedClinics();
  await seedUsers();
  await seedPatients();
  await seedForms();
  await seedServices();
  await seedAppointments();
  await seedBilling();
  await seedNotifications();
  await seedSettings();

  console.log('Seed data generated successfully.');
}

seed().catch(console.error);
