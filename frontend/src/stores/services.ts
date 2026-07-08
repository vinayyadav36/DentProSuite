import { defineStore } from 'pinia';
import type { Service } from '../../../shared/types/index.js';
import { DataService } from '../services/api';

const servicesService = new DataService('/api/services', 'services');

export const useServiceStore = defineStore('services', {
  state: () => ({
    services: [] as Service[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchServices() {
      this.isLoading = true;
      this.error = null;
      try {
        this.services = await servicesService.getAll();
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch services';
      } finally {
        this.isLoading = false;
      }
    },
    async createService(data: any) {
      await servicesService.create(data);
      await this.fetchServices();
    },
    async updateService(id: string, data: any) {
      await servicesService.update(id, data);
      await this.fetchServices();
    }
  }
});
