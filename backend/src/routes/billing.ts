import { Router } from 'express';
import { getRevenueOverview } from '../controllers/billing.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles(['ADMIN'])); // Only admins can see billing

router.get('/overview', getRevenueOverview);

export default router;
