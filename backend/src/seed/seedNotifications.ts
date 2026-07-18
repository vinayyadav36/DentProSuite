import { getDatabaseAdapter } from '../storage/DatabaseService.js';

export async function seedNotifications() {
  const dbNotifications = getDatabaseAdapter<any>('notifications');

  const notifications = [
    {
      id: 'not_1',
      userId: 'user_admin',
      title: 'New Online Booking',
      message: 'John Doe requested an appointment for Professional Teeth Whitening.',
      read: false,
      timestamp: new Date().toISOString()
    },
    {
      id: 'not_2',
      userId: 'user_reception',
      title: 'Form Submitted',
      message: 'Emily Smith completed the Intake Form in the lobby.',
      read: false,
      timestamp: new Date().toISOString()
    },
    {
      id: 'not_3',
      userId: 'user_dentist_1',
      title: 'Patient Checked In',
      message: 'Emily Smith (10:30 appointment) is checked in and in Chair B.',
      read: true,
      timestamp: new Date().toISOString()
    }
  ];

  await Promise.all(notifications.map(n => dbNotifications.insert(n)));
  console.log('Seeded notifications.');
}
