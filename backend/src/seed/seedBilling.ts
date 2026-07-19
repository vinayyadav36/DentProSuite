import { getDatabaseAdapter } from '../storage/DatabaseService.js';

function getRelativeDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0] as string;
}

export async function seedBilling() {
  const dbInvoices = getDatabaseAdapter<any>('invoices');

  const invoices = [
    {
      id: 'inv_1001',
      patientId: 'pat_1',
      appointmentId: 'apt_1',
      issuedAt: getRelativeDate(0),
      dueDate: getRelativeDate(15),
      status: 'UNPAID',
      items: [
        { description: 'Dental Cleaning & Prophylaxis', quantity: 1, unitPrice: 120 },
        { description: 'Fluoride Treatment Premium Varnish', quantity: 1, unitPrice: 35 }
      ],
      payments: [],
      totalAmount: 155,
      notes: 'Insurance copay pending.'
    },
    {
      id: 'inv_1002',
      patientId: 'pat_2',
      appointmentId: 'apt_6',
      issuedAt: getRelativeDate(-5),
      dueDate: getRelativeDate(10),
      status: 'PAID',
      items: [
        { description: 'Root Canal Treatment', quantity: 1, unitPrice: 850 },
        { description: 'Local Anesthetics & Sedation Fee', quantity: 1, unitPrice: 150 }
      ],
      payments: [
        { amount: 1000, date: getRelativeDate(-5), method: 'CARD' }
      ],
      totalAmount: 1000,
      notes: 'Paid in full on checkout.'
    },
    {
      id: 'inv_1003',
      patientId: 'pat_3',
      appointmentId: 'apt_3',
      issuedAt: getRelativeDate(0),
      dueDate: getRelativeDate(10),
      status: 'PARTIALLY_PAID',
      items: [
        { description: 'Composite Dental Filling', quantity: 1, unitPrice: 175 },
        { description: 'Co-pay Patient Balance Due', quantity: 1, unitPrice: 50 }
      ],
      payments: [
        { amount: 50, date: getRelativeDate(0), method: 'CASH' }
      ],
      totalAmount: 225,
      notes: 'Remaining balance submitted to Delta Dental.'
    }
  ];

  await Promise.all(invoices.map(inv => dbInvoices.insert(inv)));
  console.log('Seeded invoices.');
}
