import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import patientRoutes from '../src/routes/patients.js';
import { generateToken } from '../src/auth/auth.js';

const app = express();
app.use(express.json());
app.use('/api/patients', patientRoutes);

const adminToken = generateToken({ id: 'admin-test', role: 'ADMIN' }, '1h');

describe('Patients Endpoints', () => {
  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });

  it('should return patients list with valid admin token', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject patient creation with missing fields', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'John' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
