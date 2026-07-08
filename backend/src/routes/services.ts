import { Router } from 'express';
import { getServices, getServiceById, createService, updateService, deleteService } from '../controllers/services.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema, updateServiceSchema } from '../../../shared/schemas/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', requireRoles(['ADMIN']), validate(createServiceSchema), createService);
router.put('/:id', requireRoles(['ADMIN']), validate(updateServiceSchema), updateService);
router.delete('/:id', requireRoles(['ADMIN']), deleteService);

export default router;
