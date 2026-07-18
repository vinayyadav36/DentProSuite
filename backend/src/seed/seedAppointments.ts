import { getDatabaseAdapter } from '../storage/DatabaseService.js';

function getRelativeDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0] as string;
}

export async function seedAppointments() {
  const dbAppointments = getDatabaseAdapter<any>('appointments');

  const appointments = [
    {
      id: 'apt_1',
      patientId: 'pat_1',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(0),
      time: '09:00',
      duration: 45,
      status: 'COMPLETED',
      serviceId: 'srv_2',
      notes: 'Routine prophylaxis. No new decay identified.',
      chairId: 'Chair A'
    },
    {
      id: 'apt_2',
      patientId: 'pat_2',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(0),
      time: '10:30',
      duration: 30,
      status: 'IN_CHAIR',
      serviceId: 'srv_1',
      notes: 'Slight tooth sensitivity on tooth #14.',
      chairId: 'Chair B'
    },
    {
      id: 'apt_3',
      patientId: 'pat_3',
      dentistId: 'user_dentist_2',
      date: getRelativeDate(0),
      time: '13:00',
      duration: 60,
      status: 'CHECKED_IN',
      serviceId: 'srv_4',
      notes: 'Composite filling on tooth #19.',
      chairId: 'Chair A'
    },
    {
      id: 'apt_4',
      patientId: 'pat_4',
      dentistId: 'user_dentist_2',
      date: getRelativeDate(0),
      time: '15:30',
      duration: 30,
      status: 'SCHEDULED',
      serviceId: 'srv_3',
      notes: 'First visit routine screening.',
      chairId: 'Chair C'
    },
    {
      id: 'apt_5',
      patientId: 'pat_1',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(3),
      time: '11:00',
      duration: 60,
      status: 'SCHEDULED',
      serviceId: 'srv_7',
      notes: 'Follow-up for whitening tray fitting.',
      chairId: 'Chair A'
    },
    {
      id: 'apt_6',
      patientId: 'pat_2',
      dentistId: 'user_dentist_2',
      date: getRelativeDate(-5),
      time: '14:00',
      duration: 90,
      status: 'COMPLETED',
      serviceId: 'srv_5',
      notes: 'Root canal on tooth #3 completed.',
      chairId: 'Chair B'
    },
    {
      id: 'apt_7',
      patientId: 'pat_3',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(1),
      time: '10:00',
      duration: 60,
      status: 'SCHEDULED',
      serviceId: 'srv_6',
      notes: 'Preparation for porcelain crown on tooth #30.',
      chairId: 'Chair B'
    }
  ];

  await Promise.all(appointments.map(a => dbAppointments.insert(a)));
  console.log('Seeded appointments.');
}
