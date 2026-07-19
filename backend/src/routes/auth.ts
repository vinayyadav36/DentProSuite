import { Router } from 'express';
import { login, me } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../../../shared/schemas/index.js';

const router = Router();

router.post('/login', loginLimiter as any, validate(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
