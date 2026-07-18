import { Request, Response } from 'express';
import { getDatabaseAdapter } from '../storage/DatabaseService.js';

interface ClinicSettings {
  id: string;
  clinicId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  operatingHours: Record<string, { open: string; close: string; active: boolean }>;
  chairs: string[];
  autoSync: boolean;
  offlineMode: boolean;
  appwriteConfig: {
    endpoint: string;
    projectId: string;
    connected: boolean;
  };
}

const DEFAULT_SETTINGS_ID = 'settings_default';

const dbSettings = getDatabaseAdapter<ClinicSettings>('settings');

const DEFAULT_SETTINGS: ClinicSettings = {
  id: DEFAULT_SETTINGS_ID,
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

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await dbSettings.getById(DEFAULT_SETTINGS_ID);
    if (!settings) {
      settings = await dbSettings.insert(DEFAULT_SETTINGS);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await dbSettings.getById(DEFAULT_SETTINGS_ID);
    if (!settings) {
      settings = await dbSettings.insert(DEFAULT_SETTINGS);
    }

    const updated = await dbSettings.update(DEFAULT_SETTINGS_ID, req.body);
    if (!updated) return res.status(404).json({ error: 'Settings not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
