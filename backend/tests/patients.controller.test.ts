import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import patientRoutes from '../src/routes/patients.js';
import { generateToken } from '../src/auth/auth.js';
import { getDatabaseAdapter } from '../src/storage/DatabaseService.js';
import { Patient } from '../../shared/types/index.js';

describe('Patients Controller', () => {
  let app: express.Express;
  const dbPatients = getDatabaseAdapter<Patient>('patients');

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/patients', patientRoutes);

    const items = await dbPatients.getAll();
    for (const i of items) {
      await dbPatients.delete(i.id);
    }
  });

  afterEach(async () => {
    const items = await dbPatients.getAll();
    for (const i of items) {
      await dbPatients.delete(i.id);
    }
  });

  const getValidToken = (role: 'ADMIN' | 'DENTIST' | 'RECEPTION' | 'PATIENT' = 'RECEPTION') => {
    return generateToken({ id: 'user-1', role });
  };

  describe('POST /patients', () => {
    it('returns 401 for missing token', async () => {
      const res = await request(app).post('/patients').send({ firstName: 'Test' });
      expect(res.status).toBe(401);
    });

    it('returns 403 for invalid role', async () => {
      const token = getValidToken('PATIENT');
      const res = await request(app)
        .post('/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Test' });
      // Depending on auth config, might be 403. Assuming RECEPTION or higher needed.
      expect(res.status).toBe(403);
    });

    it('returns 400 for missing required fields/validation failure', async () => {
      const token = getValidToken('RECEPTION');
      const payload = {
        firstName: 'John',
        // missing required fields according to schema, assuming schema exists
      };
      const res = await request(app)
        .post('/patients')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // We expect the validation middleware to catch it
      expect(res.status).toBe(400);
    });

    it('returns 201 for valid request', async () => {
      const token = getValidToken('RECEPTION');
      const payload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        phone: '123456789',
        dateOfBirth: '1990-01-01',
        medicalHistory: {}
      };
      const res = await request(app)
        .post('/patients')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.firstName).toBe('John');
    });
  });

  describe('PUT /patients/:id', () => {
    it('returns 404 for missing patient', async () => {
      const token = getValidToken('RECEPTION');
      const res = await request(app)
        .put('/patients/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Updated', lastName: 'Name', dateOfBirth: '2000-01-01', phone: '123', email: 'update@test.com' });
      expect(res.status).toBe(404);
    });

    it('returns 200 and updated patient for valid request', async () => {
      const token = getValidToken('RECEPTION');
      const newPatient = await dbPatients.insert({
        id: 'patient-update-1',
        firstName: 'Old',
        lastName: 'Name',
        email: 'old@name.com',
        phone: '111',
        dateOfBirth: '1990-01-01',
        medicalHistory: {},
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .put(`/patients/${newPatient.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'New', lastName: 'Name', dateOfBirth: '1990-01-01', phone: '111', email: 'old@name.com' });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('New');
    });
  });
});
