import { Router } from 'express';
import { getClinics, getClinicById, createClinic, updateClinic, deleteClinic } from '../controllers/clinics.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createClinicSchema, updateClinicSchema } from '../../../shared/schemas/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', getClinics);
router.get('/:id', getClinicById);
router.post('/', requireRoles(['ADMIN']), validate(createClinicSchema), createClinic);
router.put('/:id', requireRoles(['ADMIN']), validate(updateClinicSchema), updateClinic);
router.delete('/:id', requireRoles(['ADMIN']), deleteClinic);

export default router;
