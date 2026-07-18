import { Router } from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patients.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimiter.js';
import { createPatientSchema, updatePatientSchema } from '../../../shared/schemas/index.js';

const router = Router();

router.use(requireAuth);
router.use(writeLimiter as any);

router.get('/', getPatients);
router.get('/:id', getPatientById);

router.post('/', requireRoles(['ADMIN', 'RECEPTION']), validate(createPatientSchema), createPatient);
router.put('/:id', requireRoles(['ADMIN', 'RECEPTION', 'DENTIST']), validate(updatePatientSchema), updatePatient);
router.delete('/:id', requireRoles(['ADMIN']), deletePatient);

export default router;
