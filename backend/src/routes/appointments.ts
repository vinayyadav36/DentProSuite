import { Router } from 'express';
import { getAppointments, createAppointment, updateAppointment } from '../controllers/appointments.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAppointments);
router.post('/', requireRoles(['ADMIN', 'RECEPTION']), createAppointment);
// Dentists can update status
router.put('/:id', requireRoles(['ADMIN', 'RECEPTION', 'DENTIST']), updateAppointment);

export default router;
