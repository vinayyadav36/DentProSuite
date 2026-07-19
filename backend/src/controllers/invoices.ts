import { Request, Response } from 'express';
import { getDatabaseAdapter } from '../storage/DatabaseService.js';

interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  issuedAt: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  status: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';
  payments: Array<{ amount: number; date: string; method: string }>;
  totalAmount: number;
  notes?: string;
}

const dbInvoices = getDatabaseAdapter<Invoice>('invoices');

function calculateTotal(items: Invoice['items']): number {
  return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
}

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { patientId, status } = req.query;
    let invoices = await dbInvoices.getAll();

    if (patientId) {
      invoices = invoices.filter(i => i.patientId === patientId);
    }
    if (status) {
      invoices = invoices.filter(i => i.status === status);
    }

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve invoices' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const invoice = await dbInvoices.getById(id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve invoice' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const newInvoice: Invoice = {
      ...req.body,
      id: `inv_${Date.now()}`,
      totalAmount: calculateTotal(req.body.items)
    };
    const saved = await dbInvoices.insert(newInvoice);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await dbInvoices.getById(id);
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const updates = { ...req.body };
    if (updates.items) {
      updates.totalAmount = calculateTotal(updates.items);
    }
    if (updates.payments) {
      const paidAmt = updates.payments.reduce((acc: number, pay: any) => acc + pay.amount, 0);
      const total = updates.totalAmount || existing.totalAmount;
      if (paidAmt >= total) {
        updates.status = 'PAID';
      } else if (paidAmt > 0) {
        updates.status = 'PARTIALLY_PAID';
      } else {
        updates.status = 'UNPAID';
      }
    }

    const updated = await dbInvoices.update(id, updates);
    if (!updated) return res.status(404).json({ error: 'Invoice not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await dbInvoices.delete(id);
    if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
