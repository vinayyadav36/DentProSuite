import { describe, it, expect } from 'vitest';
import { envSchema } from '../src/utils/env.js';

describe('Env Schema', () => {
  it('should accept valid env vars', () => {
    const result = envSchema.safeParse({
      JWT_SECRET: 'super-secret-key-at-least-16-chars',
      NODE_ENV: 'development',
      PORT: '3001',
      FRONTEND_URL: 'http://localhost:5173',
      STORAGE_MODE: 'local',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing JWT_SECRET', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const jwtIssue = result.error.issues.find(i => i.path.includes('JWT_SECRET'));
      expect(jwtIssue).toBeDefined();
    }
  });

  it('should reject short JWT_SECRET', () => {
    const result = envSchema.safeParse({
      JWT_SECRET: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('should provide defaults for optional fields', () => {
    const result = envSchema.safeParse({
      JWT_SECRET: 'super-secret-key-at-least-16-chars',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.PORT).toBe(3001);
      expect(result.data.STORAGE_MODE).toBe('local');
      expect(result.data.FRONTEND_URL).toBe('http://localhost:5173');
    }
  });

  it('should require Appwrite vars when STORAGE_MODE is appwrite', () => {
    const result = envSchema.safeParse({
      JWT_SECRET: 'super-secret-key-at-least-16-chars',
      STORAGE_MODE: 'appwrite',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const appwriteIssues = result.error.issues.filter(i =>
        i.path.some(p => typeof p === 'string' && p.startsWith('APPWRITE_'))
      );
      expect(appwriteIssues.length).toBeGreaterThanOrEqual(4);
    }
  });
});
