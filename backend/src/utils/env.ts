import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Canonical storage adapter name
  STORAGE_ADAPTER: z.enum(['local', 'local-json', 'appwrite']).default('local'),
  // Backwards compatibility alias
  STORAGE_MODE: z.enum(['local', 'local-json', 'appwrite']).optional(),

  APPWRITE_ENDPOINT: z.string().url().optional(),
  APPWRITE_PROJECT_ID: z.string().optional(),
  APPWRITE_API_KEY: z.string().optional(),
  APPWRITE_DATABASE_ID: z.string().optional(),
}).refine(data => {
  const mode = data.STORAGE_ADAPTER;
  if (mode === 'appwrite') {
    return !!(data.APPWRITE_ENDPOINT && data.APPWRITE_PROJECT_ID && data.APPWRITE_API_KEY && data.APPWRITE_DATABASE_ID);
  }
  return true;
}, {
  message: "Appwrite configuration is required when storage adapter is 'appwrite'",
  path: ["APPWRITE_ENDPOINT"],
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig;

export function validateEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function getEnv(): EnvConfig {
  if (!cachedEnv) return validateEnv();
  return cachedEnv;
}
