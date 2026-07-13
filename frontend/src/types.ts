export type UserRole = 'ADMIN' | 'RECEPTION' | 'DENTIST' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface Clinic {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  subscriptionTier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'TRIAL' | 'CANCELLED';
  monthlyPrice: number;
  nextBillingDate: string; // YYYY-MM-DD
}

export interface Session {
  user: User;
  patientId?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  medicalHistory: string[];
  emergencyContact: string;
  notes: string;
  createdAt: string;
  photoUrl?: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'CHECKED_IN' | 'IN_CHAIR' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string; // User ID with role DENTIST
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes
  status: AppointmentStatus;
  serviceId: string;
  notes?: string;
  chairId?: string; // e.g. "Chair A", "Chair B"
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select';
  options?: string[];
  required: boolean;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  templateId: string;
  patientId: string;
  submittedAt: string;
  data: Record<string, any>;
  status: 'PENDING' | 'COMPLETED';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentRecord {
  amount: number;
  date: string;
  method: 'CASH' | 'CARD' | 'INSURANCE' | 'BANK_TRANSFER';
}

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  issuedAt: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  status: InvoiceStatus;
  payments: PaymentRecord[];
  totalAmount: number;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface ClinicSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  operatingHours: {
    [key: string]: { open: string; close: string; active: boolean }; // key = "monday", "tuesday", etc.
  };
  chairs: string[]; // e.g. ["Chair 1", "Chair 2", "Chair 3"]
  autoSync: boolean;
  offlineMode: boolean;
  appwriteConfig: {
    endpoint: string;
    projectId: string;
    connected: boolean;
  };
}

export interface SyncState {
  lastSyncedAt: string | null;
  status: 'synced' | 'offline' | 'syncing' | 'error' | 'conflict';
  pendingChangesCount: number;
}
