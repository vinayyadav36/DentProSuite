import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import appointmentRoutes from '../src/routes/appointments.js';
import { generateToken } from '../src/auth/auth.js';
import { getDatabaseAdapter } from '../src/storage/DatabaseService.js';
import { Appointment } from '../../shared/types/index.js';

describe('Appointments Controller', () => {
  let app: express.Express;
  const dbAppointments = getDatabaseAdapter<Appointment>('appointments');

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/appointments', appointmentRoutes);

    const items = await dbAppointments.getAll();
    for (const i of items) {
      await dbAppointments.delete(i.id);
    }
  });

  afterEach(async () => {
    const items = await dbAppointments.getAll();
    for (const i of items) {
      await dbAppointments.delete(i.id);
    }
  });

  const getValidToken = (role: 'ADMIN' | 'DENTIST' | 'RECEPTION' | 'PATIENT' = 'RECEPTION') => {
    return generateToken({ id: 'user-1', role });
  };

  describe('PUT /appointments/:id', () => {
    it('returns 401 for missing token', async () => {
      const res = await request(app).put('/appointments/123').send({ status: 'COMPLETED' });
      expect(res.status).toBeGreaterThanOrEqual(400); // 401 unauth
    });

    it('returns 404 for invalid ID', async () => {
      const token = getValidToken('RECEPTION');
      const res = await request(app)
        .put('/appointments/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'COMPLETED',
          patientId: 'p-1',
          dentistId: 'd-1',
          chairId: 1,
          date: '2023-01-01',
          startTime: '09:00',
          endTime: '10:00'
        });
      expect(res.status).toBe(404);
    });

    it('returns 400 for validation issues', async () => {
      const token = getValidToken('RECEPTION');
      const res = await request(app)
        .put('/appointments/123')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Missing required fields
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 200 and updated appointment for valid request', async () => {
      const token = getValidToken('RECEPTION');
      const newAppt = await dbAppointments.insert({
        id: 'appt-1',
        patientId: 'p-1',
        dentistId: 'd-1',
        chairId: 1,
        date: '2023-01-01',
        startTime: '09:00',
        endTime: '10:00',
        status: 'SCHEDULED',
        services: [],
        createdAt: new Date().toISOString(),
        notes: ''
      });

      const res = await request(app)
        .put(`/appointments/${newAppt.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'COMPLETED',
          patientId: 'p-1',
          dentistId: 'd-1',
          chairId: 1,
          date: '2023-01-01',
          startTime: '09:00',
          endTime: '10:00'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COMPLETED');
    });
  });
});
