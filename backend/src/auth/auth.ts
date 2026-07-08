import jwt, { type SignOptions } from 'jsonwebtoken';
import { getEnv } from '../utils/env.js';
export function generateToken(payload: object, expiresIn: SignOptions['expiresIn'] = '1d') {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as SignOptions);
}

export function verifyToken(token: string) {
  const env = getEnv();
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}
