import { Router } from 'express';
import { getNotifications, createNotification, markNotificationRead, deleteNotification } from '../controllers/notifications.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimiter.js';
import { createNotificationSchema } from '../../../shared/schemas/index.js';

const router = Router();

router.use(requireAuth);
router.use(writeLimiter as any);

router.get('/', getNotifications);

router.post('/', requireRoles(['ADMIN', 'RECEPTION']), validate(createNotificationSchema), createNotification);

router.put('/:id/read', markNotificationRead);

router.delete('/:id', requireRoles(['ADMIN']), deleteNotification);

export default router;
