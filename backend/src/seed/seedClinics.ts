import { getDatabaseAdapter } from '../storage/DatabaseService.js';
import { Clinic } from '../../../shared/types/index.js';

export async function seedClinics() {
  const dbClinics = getDatabaseAdapter<Clinic>('clinics');

  const clinics: Clinic[] = [
    {
      id: 'clinic-1',
      name: 'DentistPro360 Demo Clinic',
      address: '123 Fake St, Springfield',
      chairs: 3,
      operatingHours: { start: '08:00', end: '18:00' }
    }
  ];

  await Promise.all(clinics.map(c => dbClinics.insert(c)));
  console.log('Seeded clinics.');
}
