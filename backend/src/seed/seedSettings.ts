import { getDatabaseAdapter } from '../storage/DatabaseService.js';

export async function seedSettings() {
  const dbSettings = getDatabaseAdapter<any>('settings');

  const settings = {
    id: 'settings_default',
    clinicId: 'clinic_primary',
    name: 'DentProSuite Dental Clinic',
    phone: '+1 (555) 100-3000',
    email: 'info@dentprosuite.com',
    address: '100 Medical Arts Parkway, Suite 400, Portland, OR 97201',
    operatingHours: {
      monday: { open: '08:00', close: '17:00', active: true },
      tuesday: { open: '08:00', close: '17:00', active: true },
      wednesday: { open: '08:00', close: '17:00', active: true },
      thursday: { open: '08:00', close: '17:00', active: true },
      friday: { open: '08:00', close: '16:00', active: true },
      saturday: { open: '09:00', close: '13:00', active: false },
      sunday: { open: '09:00', close: '13:00', active: false }
    },
    chairs: ['Chair A', 'Chair B', 'Chair C'],
    autoSync: true,
    offlineMode: false,
    appwriteConfig: {
      endpoint: 'https://cloud.appwrite.io/v1',
      projectId: 'dentprosuite-primary',
      connected: false
    }
  };

  await dbSettings.insert(settings);
  console.log('Seeded settings.');
}
