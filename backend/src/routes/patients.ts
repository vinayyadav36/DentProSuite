import { Router } from 'express';
import { getPatients, getPatientById, createPatient, updatePatient } from '../controllers/patients.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

// Protect all patient routes
router.use(requireAuth);

router.get('/', getPatients);
router.get('/:id', getPatientById);

// Only admins and reception can create/update patients directly
router.post('/', requireRoles(['ADMIN', 'RECEPTION']), createPatient);
router.put('/:id', requireRoles(['ADMIN', 'RECEPTION', 'DENTIST']), updatePatient);

export default router;
