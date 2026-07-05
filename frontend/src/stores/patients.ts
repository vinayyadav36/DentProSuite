import { defineStore } from 'pinia';
import type { Patient } from '../../../shared/types/index.js';
<<<<<<< HEAD
import { useAuthStore } from './auth.js';
import { cacheData, getCachedData } from '../services/offlineStorage.js';
=======
import { DataService } from '../services/api';
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3

const patientsService = new DataService('/api/patients', 'patients');

export const usePatientStore = defineStore('patients', {
  state: () => ({
    patients: [] as Patient[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPatients() {
      this.isLoading = true;
      this.error = null;
      try {
<<<<<<< HEAD
        const res = await fetch(`${API_URL}/patients`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (res.ok) {
          this.patients = await res.json();
          await cacheData('patients_list', this.patients);
        }
      } catch (err) {
          const cached = await getCachedData('patients_list');
          if (cached) {
            this.patients = cached;
          }
=======
        this.patients = await patientsService.getAll();
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch patients';
      } finally {
        this.isLoading = false;
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3
      }
    }
  }
});
