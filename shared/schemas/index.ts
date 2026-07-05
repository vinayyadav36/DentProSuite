import { z } from 'zod';

export const APPOINTMENT_STATUSES = ['SCHEDULED', 'CHECKED_IN', 'IN_CHAIR', 'COMPLETED', 'NO_SHOW'] as const;
export const USER_ROLES = ['ADMIN', 'RECEPTION', 'DENTIST', 'PATIENT'] as const;
export const FORM_FIELD_TYPES = ['text', 'checkbox', 'date', 'signature', 'select'] as const;

export const DEFAULT_CLINIC_HOURS = {
  start: '08:00',
  end: '18:00'
};

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  medicalHistory: z.record(z.string(), z.any()).optional().default({})
});

export const updatePatientSchema = createPatientSchema.partial();

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  dentistId: z.string().min(1, 'Dentist ID is required'),
  chairId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
  status: z.enum(APPOINTMENT_STATUSES).optional().default('SCHEDULED'),
  notes: z.string().optional(),
  services: z.array(z.string()).optional().default([])
});

export const updateAppointmentSchema = z.object({
  patientId: z.string().optional(),
  dentistId: z.string().optional(),
  chairId: z.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  notes: z.string().optional(),
  services: z.array(z.string()).optional()
});

export const createTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
  fields: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(FORM_FIELD_TYPES),
    label: z.string().min(1, 'Field label is required'),
    required: z.boolean().optional().default(false),
    options: z.array(z.string()).optional()
  })).min(1, 'At least one field is required')
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const submitFormSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  data: z.record(z.string(), z.any()),
  submittedBy: z.string().optional()
});

export const revenueQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD')
});
