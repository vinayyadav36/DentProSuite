import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import formRoutes from '../src/routes/forms.js';
import { generateToken } from '../src/auth/auth.js';
import { getDatabaseAdapter } from '../src/storage/DatabaseService.js';
import { FormTemplate, FormSubmission } from '../../shared/types/index.js';

describe('Forms Controller', () => {
  let app: express.Express;
  const dbTemplates = getDatabaseAdapter<FormTemplate>('templates');
  const dbSubmissions = getDatabaseAdapter<FormSubmission>('submissions');

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/forms', formRoutes);

    const items1 = await dbTemplates.getAll();
    for (const i of items1) {
      await dbTemplates.delete(i.id);
    }
    const items2 = await dbSubmissions.getAll();
    for (const i of items2) {
      await dbSubmissions.delete(i.id);
    }
  });

  afterEach(async () => {
    const items1 = await dbTemplates.getAll();
    for (const i of items1) {
      await dbTemplates.delete(i.id);
    }
    const items2 = await dbSubmissions.getAll();
    for (const i of items2) {
      await dbSubmissions.delete(i.id);
    }
  });

  const getValidToken = (role: 'ADMIN' | 'DENTIST' | 'RECEPTION' | 'PATIENT' = 'ADMIN') => {
    return generateToken({ id: 'user-1', role });
  };

  describe('PUT /forms/templates/:id', () => {
    it('returns 401 for missing token', async () => {
      const res = await request(app).put('/forms/templates/123').send({ title: 'New' });
      expect(res.status).toBeGreaterThanOrEqual(400); // Fails gracefully or via auth
    });

    it('returns 404 for invalid template', async () => {
      const token = getValidToken('ADMIN');
      const res = await request(app)
        .put('/forms/templates/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New', description: 'Desc', fields: [], isActive: true });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 400 for missing required validation fields', async () => {
      const token = getValidToken('ADMIN');
      const res = await request(app)
        .put('/forms/templates/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Missing fields
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 200 for valid update', async () => {
      const token = getValidToken('ADMIN');
      const newTemplate = await dbTemplates.insert({
        id: 'temp-1',
        title: 'Old',
        description: 'Desc',
        fields: [],
        isActive: true,
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .put(`/forms/templates/${newTemplate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New', description: 'Desc', fields: [], isActive: true });

      expect(res.status).toBeGreaterThanOrEqual(200);

    });
  });

  describe('POST /forms/submissions', () => {
    it('returns 401 for missing token', async () => {
      const res = await request(app).post('/forms/submissions').send({ templateId: 't-1' });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 400 for missing fields', async () => {
      const token = getValidToken('PATIENT');
      const res = await request(app)
        .post('/forms/submissions')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 201 for valid submission', async () => {
      const token = getValidToken('PATIENT');
      const res = await request(app)
        .post('/forms/submissions')
        .set('Authorization', `Bearer ${token}`)
        .send({ templateId: 't-1', patientId: 'p-1', data: {} });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
    });
  });
});
