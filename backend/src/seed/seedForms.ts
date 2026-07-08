import { getDatabaseAdapter } from '../storage/DatabaseService.js';
import { FormTemplate } from '../../../shared/types/index.js';

export async function seedForms() {
  const dbTemplates = getDatabaseAdapter<FormTemplate>('templates');

  await dbTemplates.insert({
    id: 'template-intake',
    title: 'New Patient Intake',
    description: 'Basic info for new patients.',
    isActive: true,
    createdAt: new Date().toISOString(),
    fields: [
      { id: 'f1', type: 'text', label: 'Full Name', required: true } as any,
      { id: 'f2', type: 'checkbox', label: 'Have you had dental surgery before?', required: false } as any,
      { id: 'f3', type: 'signature', label: 'Signature', required: true } as any
    ]
  });

  await dbTemplates.insert({
    id: 'template-consent',
    title: 'Informed Consent',
    description: 'Consent for standard procedures.',
    isActive: true,
    createdAt: new Date().toISOString(),
    fields: [
      { id: 'f1', type: 'text', label: 'Procedure Name', required: true } as any,
      { id: 'f2', type: 'signature', label: 'Patient Signature', required: true } as any
    ]
  });

  console.log('Seeded forms.');
}
