import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimiter.js';
import { updateSettingsSchema } from '../../../shared/schemas/index.js';

const router = Router();

router.use(requireAuth);
router.use(writeLimiter as any);

router.get('/', getSettings);

router.put('/', requireRoles(['ADMIN']), validate(updateSettingsSchema), updateSettings);

export default router;
