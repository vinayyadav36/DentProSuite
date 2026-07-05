import { Router } from 'express';
import { getRevenueOverview } from '../controllers/billing.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { revenueQuerySchema } from '../../../shared/schemas/index.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles(['ADMIN']));

router.get('/overview', validate(revenueQuerySchema, 'query'), getRevenueOverview);

export default router;
