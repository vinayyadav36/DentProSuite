import { defineStore } from 'pinia';
import type { Clinic } from '../../../shared/types/index.js';
import { DataService } from '../services/api';

const clinicsService = new DataService('/api/clinics', 'clinics');

export const useClinicStore = defineStore('clinics', {
  state: () => ({
    clinics: [] as Clinic[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchClinics() {
      this.isLoading = true;
      this.error = null;
      try {
        this.clinics = await clinicsService.getAll();
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch clinics';
      } finally {
        this.isLoading = false;
      }
    },
    async createClinic(data: any) {
      await clinicsService.create(data);
      await this.fetchClinics();
    },
    async updateClinic(id: string, data: any) {
      await clinicsService.update(id, data);
      await this.fetchClinics();
    }
  }
});
