export type UserRole = 'ADMIN' | 'RECEPTION' | 'DENTIST' | 'PATIENT';

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Salted hash
  role: UserRole;
  name: string;
  createdAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  chairs: number;
  operatingHours: {
    start: string;
    end: string;
  };
}

export interface Patient {
  id: string;
  userId?: string; // If they have a portal account
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  medicalHistory: Record<string, any>;
  createdAt: string;
}

export interface FormTemplateField {
  id: string;
  type: 'text' | 'checkbox' | 'date' | 'signature' | 'select';
  label: string;
  required: boolean;
  options?: string[]; // For select or multiple choice
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormTemplateField[];
  isActive: boolean;
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  templateId: string;
  patientId: string;
  data: Record<string, any>; // Keyed by field id
  submittedAt: string;
  submittedBy?: string; // User ID if applicable
}

export type AppointmentStatus = 'SCHEDULED' | 'CHECKED_IN' | 'IN_CHAIR' | 'COMPLETED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  chairId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  services: string[]; // Service IDs
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface RevenueSummary {
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  appointmentsCompleted: number;
}
