import { Router } from 'express';
import { getTemplates, createTemplate, updateTemplate, getSubmissions, submitForm } from '../controllers/forms.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

// Templates
router.get('/templates', getTemplates); // Patients might need to fetch a template by ID, or staff fetches all
router.post('/templates', requireAuth, requireRoles(['ADMIN']), createTemplate);
router.put('/templates/:id', requireAuth, requireRoles(['ADMIN']), updateTemplate);

// Submissions
router.get('/submissions', requireAuth, getSubmissions);
// A patient taking the form on a tablet might not have an auth token if it's a public link,
// but for this scope we can assume the tablet is logged in as 'RECEPTION' or 'PATIENT' role.
router.post('/submissions', submitForm);

export default router;
