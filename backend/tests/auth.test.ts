import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import authRoutes from '../src/routes/auth.js';
import { generateToken, verifyToken } from '../src/auth/auth.js';
import { getDatabaseAdapter } from '../src/storage/DatabaseService.js';
import { User } from '../../shared/types/index.js';
import bcrypt from 'bcrypt';

describe('Auth Controller & Token Validation', () => {
  let app: express.Express;
  const dbUsers = getDatabaseAdapter<User>('users');

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);

    // Clean up DB before test
    const users = await dbUsers.getAll();
    for (const u of users) {
      await dbUsers.delete(u.id);
    }
  });

  afterEach(async () => {
    const users = await dbUsers.getAll();
    for (const u of users) {
      await dbUsers.delete(u.id);
    }
  });

  describe('POST /auth/login', () => {
    it('returns 400 for missing email or password', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('returns 401 for wrong password', async () => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('correctpassword', salt);
      await dbUsers.insert({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash,
        name: 'Test',
        role: 'DENTIST',
        createdAt: new Date().toISOString()
      });

      const res = await request(app).post('/auth/login').send({
        email: 'test@test.com',
        password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
    });

    it('returns token and profile on successful login', async () => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('correctpassword', salt);
      await dbUsers.insert({
        id: 'user-2',
        email: 'success@test.com',
        passwordHash,
        name: 'Success Test',
        role: 'DENTIST',
        createdAt: new Date().toISOString()
      });

      const res = await request(app).post('/auth/login').send({
        email: 'success@test.com',
        password: 'correctpassword'
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('success@test.com');
      expect(res.body.user.passwordHash).toBeUndefined(); // Should not return hash
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 for missing token', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 for invalid token format', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });

    it('returns 401 for expired/invalid token format in verifyToken', () => {
      const res = verifyToken('not a valid token');
      expect(res).toBe(null);
    });

    it('returns 200 and profile for valid token', async () => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password', salt);
      await dbUsers.insert({
        id: 'user-me-1',
        email: 'me@test.com',
        passwordHash,
        name: 'Me Test',
        role: 'RECEPTION',
        createdAt: new Date().toISOString()
      });

      const token = generateToken({ id: 'user-me-1', role: 'RECEPTION' });

      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe('user-me-1');
      expect(res.body.user.email).toBe('me@test.com');
      expect(res.body.user.passwordHash).toBeUndefined();
    });
  });
});
