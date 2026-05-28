import { defineStore } from 'pinia';
import type { Patient } from '../../../shared/types/index.js';
import { useAuthStore } from './auth.js';

const API_URL = 'http://localhost:3001/api';

export const usePatientStore = defineStore('patients', {
  state: () => ({
    patients: [] as Patient[],
  }),
  actions: {
    async fetchPatients() {
      const auth = useAuthStore();
      if (!auth.token) return;
      try {
        const res = await fetch(`${API_URL}/patients`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (res.ok) {
          this.patients = await res.json();
        }
      } catch (err) {
        //
      }
    }
  }
});
