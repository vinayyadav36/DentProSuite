import { defineStore } from 'pinia';
import type { Appointment } from '../../../shared/types/index.js';
<<<<<<< HEAD
import { useAuthStore } from './auth.js';
import { cacheData, getCachedData, queueSyncRequest } from '../services/offlineStorage.js';
=======
import { DataService } from '../services/api';
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3

const appointmentsService = new DataService('/api/appointments', 'appointments');

export const useAppointmentStore = defineStore('appointments', {
  state: () => ({
    appointments: [] as Appointment[],
<<<<<<< HEAD
    loading: false,
=======
    isLoading: false,
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3
    error: null as string | null,
  }),
  actions: {
    async fetchAppointments(date?: string, dentistId?: string) {
<<<<<<< HEAD
      const auth = useAuthStore();
      if (!auth.token) return;

      this.loading = true;
      this.error = null;
      let url = `${API_URL}/appointments?`;
      if (date) url += `date=${date}&`;
      if (dentistId) url += `dentistId=${dentistId}`;

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (res.ok) {
          this.appointments = await res.json();
          await cacheData('appointments', this.appointments);
        } else {
          this.error = 'Failed to fetch appointments';
        }
      } catch {
        const cached = await getCachedData('appointments');
        if (cached) {
          this.appointments = cached;
        } else {
          this.error = 'Network error and no cached data available';
        }
      } finally {
        this.loading = false;
=======
      this.isLoading = true;
      this.error = null;
      try {
        const params: any = {};
        if (date) params.date = date;
        if (dentistId) params.dentistId = dentistId;

        this.appointments = await appointmentsService.getAll(params);
      } catch (err: any) {
         this.error = err.message || 'Failed to fetch appointments';
      } finally {
        this.isLoading = false;
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3
      }
    },

    async updateStatus(id: string, status: string) {
       // Optimistic update
       const index = this.appointments.findIndex(a => a.id === id);
       if (index !== -1) {
           this.appointments[index].status = status as any;
       }

       try {
<<<<<<< HEAD
         const res = await fetch(`${API_URL}/appointments/${id}`, {
           method: 'PUT',
           headers: {
             'Content-Type': 'application/json',
             Authorization: `Bearer ${auth.token}`
           },
           body: JSON.stringify({ status })
         });

         if (!res.ok) throw new Error('Request failed');
         localStorage.setItem('cachedAppointments', JSON.stringify(this.appointments));
       } catch {
          await queueSyncRequest(
           `${API_URL}/appointments/${id}`,
           'PUT',
           { status },
           { Authorization: `Bearer ${auth.token}` }
          );
         localStorage.setItem('cachedAppointments', JSON.stringify(this.appointments));
=======
         await appointmentsService.update(id, { status });
       } catch (err) {
         console.warn('Update failed, optimistic state preserved or sync queued.', err);
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3
       }
    }
  }
});
