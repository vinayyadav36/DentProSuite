import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
  it('should return 400 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@clinic.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toBeDefined();
  });

  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
