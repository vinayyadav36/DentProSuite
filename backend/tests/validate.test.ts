import { describe, it, expect, vi } from 'vitest';
import { validate } from '../src/middleware/validate.js';
import { loginSchema, createPatientSchema } from '../../shared/schemas/index.js';
import type { Request, Response, NextFunction } from 'express';

function mockReqRes(body: any): { req: Partial<Request>; res: Partial<Response>; next: NextFunction } {
  const req = { body } as Partial<Request>;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('Validation Middleware', () => {
  it('should call next() when body is valid for login', () => {
    const { req, res, next } = mockReqRes({ email: 'test@test.com', password: 'secret' });
    validate(loginSchema)(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 when email is missing', () => {
    const { req, res, next } = mockReqRes({ password: 'secret' });
    validate(loginSchema)(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Validation failed', details: expect.any(Array) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 when email is invalid format', () => {
    const { req, res, next } = mockReqRes({ email: 'not-an-email', password: 'secret' });
    validate(loginSchema)(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should replace req.body with parsed data (with defaults)', () => {
    const { req, res, next } = mockReqRes({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phone: '555-0100',
      email: 'john@test.com',
    });
    validate(createPatientSchema)(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toHaveProperty('medicalHistory', {});
  });

  it('should validate nested objects (patient creation)', () => {
    const { req, res, next } = mockReqRes({ firstName: 'John' });
    validate(createPatientSchema)(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
