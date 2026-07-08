import { getDatabaseAdapter } from '../storage/DatabaseService.js';
import { Appointment } from '../../../shared/types/index.js';

export async function seedAppointments() {
  const dbAppointments = getDatabaseAdapter<Appointment>('appointments');
  const today = new Date().toISOString().split('T')[0] as string;

  await dbAppointments.insert({
    id: 'appt-1',
    patientId: 'patient-1',
    dentistId: 'dentist-1',
    chairId: 1,
    date: today,
    startTime: '09:00',
    endTime: '10:00',
    status: 'SCHEDULED',
    services: [],
    createdAt: new Date().toISOString(),
    notes: ''
  });

  await dbAppointments.insert({
    id: 'appt-2',
    patientId: 'patient-2',
    dentistId: 'dentist-1',
    chairId: 1,
    date: today,
    startTime: '10:00',
    endTime: '11:00',
    status: 'COMPLETED',
    services: [],
    createdAt: new Date().toISOString(),
    notes: ''
  });

  console.log('Seeded appointments.');
}
