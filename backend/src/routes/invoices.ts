import { Router } from 'express';
import { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoices.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimiter.js';
import { createInvoiceSchema, updateInvoiceSchema } from '../../../shared/schemas/index.js';

const router = Router();

router.use(requireAuth);
router.use(writeLimiter as any);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

router.post('/', requireRoles(['ADMIN', 'RECEPTION']), validate(createInvoiceSchema), createInvoice);
router.put('/:id', requireRoles(['ADMIN', 'RECEPTION']), validate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', requireRoles(['ADMIN']), deleteInvoice);

export default router;
