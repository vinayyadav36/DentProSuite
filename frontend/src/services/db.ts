import { 
  User, Session, Clinic, Patient, Appointment, Service, FormTemplate, 
  FormSubmission, Invoice, Notification, ClinicSettings, SyncState 
} from '../types';

const STORAGE_KEY = 'dentprosuite_db_state';

// Predefined Services
const DEFAULT_SERVICES: Service[] = [
  { id: 'srv_1', name: 'Comprehensive Oral Exam', price: 85, duration: 30 },
  { id: 'srv_2', name: 'Dental Cleaning & Prophylaxis', price: 120, duration: 45 },
  { id: 'srv_3', name: 'Digital X-Rays & Screening', price: 75, duration: 15 },
  { id: 'srv_4', name: 'Composite Dental Filling', price: 175, duration: 45 },
  { id: 'srv_5', name: 'Root Canal Treatment', price: 850, duration: 90 },
  { id: 'srv_6', name: 'Porcelain Dental Crown', price: 1100, duration: 60 },
  { id: 'srv_7', name: 'Professional Teeth Whitening', price: 350, duration: 60 },
];

// Predefined Form Templates
const DEFAULT_FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'form_template_intake',
    title: 'New Patient Intake Form',
    description: 'General demographic and basic health record setup for new patients.',
    createdAt: '2026-06-01',
    fields: [
      { id: 'f_emergency_name', label: 'Emergency Contact Name', type: 'text', required: true },
      { id: 'f_emergency_phone', label: 'Emergency Contact Phone', type: 'text', required: true },
      { id: 'f_allergies', label: 'Do you have any known allergies?', type: 'textarea', required: false },
      { id: 'f_medications', label: 'List any current medications', type: 'textarea', required: false },
      { id: 'f_smoker', label: 'Are you a tobacco user?', type: 'select', options: ['No', 'Yes', 'Socially'], required: true },
    ]
  },
  {
    id: 'form_template_consent',
    title: 'Treatment Consent & Disclosure',
    description: 'Informed consent for routine dental procedures and local anesthesia.',
    createdAt: '2026-06-15',
    fields: [
      { id: 'f_understand_risks', label: 'I understand the standard risks of dental treatment', type: 'checkbox', required: true },
      { id: 'f_accurate_history', label: 'I confirm the medical history provided is fully accurate', type: 'checkbox', required: true },
      { id: 'f_sig_name', label: 'Full Legal Signature (Type Name)', type: 'text', required: true },
    ]
  }
];

// Seed Users with passwords for demo access
export const SEED_USERS = [
  { id: 'user_admin', name: 'Dr. Arthur Vance', email: 'admin@dentpro.com', role: 'ADMIN' as const, phone: '+1 (555) 101-2030' },
  { id: 'user_reception', name: 'Clara Oswald', email: 'reception@dentpro.com', role: 'RECEPTION' as const, phone: '+1 (555) 101-2031' },
  { id: 'user_dentist_1', name: 'Dr. Sarah Carter', email: 'dentist1@dentpro.com', role: 'DENTIST' as const, phone: '+1 (555) 101-2032' },
  { id: 'user_dentist_2', name: 'Dr. Marcus Vance', email: 'dentist2@dentpro.com', role: 'DENTIST' as const, phone: '+1 (555) 101-2033' },
  { id: 'user_patient', name: 'John Doe', email: 'patient@dentpro.com', role: 'PATIENT' as const, phone: '+1 (555) 304-4501' },
];

// Helper to get formatted date string relative to today
function getRelativeDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

interface DatabaseState {
  patients: Patient[];
  appointments: Appointment[];
  services: Service[];
  formTemplates: FormTemplate[];
  formSubmissions: FormSubmission[];
  invoices: Invoice[];
  notifications: Notification[];
  settings: ClinicSettings;
  syncState: SyncState;
}

const INITIAL_STATE: DatabaseState = {
  patients: [
    {
      id: 'pat_1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@dentpro.com',
      phone: '+1 (555) 304-4501',
      dob: '1988-11-24',
      gender: 'Male',
      address: '742 Evergreen Terrace, Springfield, OR',
      medicalHistory: ['Penicillin Allergy', 'Mild Hypertension'],
      emergencyContact: 'Jane Doe (+1 (555) 304-4502)',
      notes: 'Slight anxiety regarding root-canals. Prefers early morning appointments.',
      createdAt: '2026-01-10'
    },
    {
      id: 'pat_2',
      firstName: 'Emily',
      lastName: 'Smith',
      email: 'emily.smith@example.com',
      phone: '+1 (555) 789-1234',
      dob: '1995-04-12',
      gender: 'Female',
      address: '128 Birch Road, Portland, OR',
      medicalHistory: [],
      emergencyContact: 'David Smith (+1 (555) 789-9876)',
      notes: 'Completed teeth whitening last month. Very pleased with results.',
      createdAt: '2026-03-22'
    },
    {
      id: 'pat_3',
      firstName: 'Robert',
      lastName: 'Chen',
      email: 'robert.chen@example.com',
      phone: '+1 (555) 456-7890',
      dob: '1975-08-03',
      gender: 'Male',
      address: '56 Pearl St, Apt 4B, Beaverton, OR',
      medicalHistory: ['Type 2 Diabetes', 'Takes Metformin'],
      emergencyContact: 'Lisa Chen (+1 (555) 456-1122)',
      notes: 'Monitor gum health closely due to diabetic history. Requires periodontal checks.',
      createdAt: '2026-04-15'
    },
    {
      id: 'pat_4',
      firstName: 'Sophia',
      lastName: 'Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (555) 234-5678',
      dob: '2001-02-14',
      gender: 'Female',
      address: '904 Oak Ave, Hillsboro, OR',
      medicalHistory: ['Asthma (uses Albuterol inhaler)'],
      emergencyContact: 'Maria Martinez (+1 (555) 234-8899)',
      notes: 'Sensitive teeth. Wants non-fluoride varnish options if possible.',
      createdAt: '2026-05-19'
    }
  ],
  appointments: [
    {
      id: 'apt_1',
      patientId: 'pat_1',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(0), // Today
      time: '09:00',
      duration: 45,
      status: 'COMPLETED',
      serviceId: 'srv_2', // Cleaning
      notes: 'Patient was on time. Routine prophylaxis. No new decay identified. Recommended flossing more frequently.',
      chairId: 'Chair A'
    },
    {
      id: 'apt_2',
      patientId: 'pat_2',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(0), // Today
      time: '10:30',
      duration: 30,
      status: 'IN_CHAIR',
      serviceId: 'srv_1', // Oral Exam
      notes: 'Slight tooth sensitivity on tooth #14. Taking panoramic digital X-rays.',
      chairId: 'Chair B'
    },
    {
      id: 'apt_3',
      patientId: 'pat_3',
      dentistId: 'user_dentist_2',
      date: getRelativeDate(0), // Today
      time: '13:00',
      duration: 60,
      status: 'CHECKED_IN',
      serviceId: 'srv_4', // Filling
      notes: 'Scheduled for composite filling on tooth #19 (Occlusal cavity).',
      chairId: 'Chair A'
    },
    {
      id: 'apt_4',
      patientId: 'pat_4',
      dentistId: 'user_dentist_2',
      date: getRelativeDate(0), // Today
      time: '15:30',
      duration: 30,
      status: 'SCHEDULED',
      serviceId: 'srv_3', // Digital X-Rays & Screening
      notes: 'First visit routine screening and hygiene planning.',
      chairId: 'Chair C'
    },
    {
      id: 'apt_5',
      patientId: 'pat_1',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(3), // 3 days from now
      time: '11:00',
      duration: 60,
      status: 'SCHEDULED',
      serviceId: 'srv_7', // Teeth Whitening
      notes: 'Follow-up appointment for whitening tray fitting and gel application guidelines.',
      chairId: 'Chair A'
    },
    {
      id: 'apt_6',
      patientId: 'pat_2',
      dentistId: 'user_dentist_2',
      date: getRelativeDate(-5), // 5 days ago
      time: '14:00',
      duration: 90,
      status: 'COMPLETED',
      serviceId: 'srv_5', // Root Canal
      notes: 'Successfully completed root canal treatment on tooth #3. Prescribed pain relief.',
      chairId: 'Chair B'
    },
    {
      id: 'apt_7',
      patientId: 'pat_3',
      dentistId: 'user_dentist_1',
      date: getRelativeDate(1), // Tomorrow
      time: '10:00',
      duration: 60,
      status: 'SCHEDULED',
      serviceId: 'srv_6', // Crown
      notes: 'Preparation of tooth #30 for porcelain crown placement.',
      chairId: 'Chair B'
    }
  ],
  services: DEFAULT_SERVICES,
  formTemplates: DEFAULT_FORM_TEMPLATES,
  formSubmissions: [
    {
      id: 'sub_1',
      templateId: 'form_template_intake',
      patientId: 'pat_1',
      submittedAt: getRelativeDate(-2) + 'T10:15:00Z',
      status: 'COMPLETED',
      data: {
        f_emergency_name: 'Jane Doe',
        f_emergency_phone: '+1 (555) 304-4502',
        f_allergies: 'Penicillin causes hives.',
        f_medications: 'None.',
        f_smoker: 'No'
      }
    },
    {
      id: 'sub_2',
      templateId: 'form_template_consent',
      patientId: 'pat_1',
      submittedAt: getRelativeDate(-2) + 'T10:18:00Z',
      status: 'COMPLETED',
      data: {
        f_understand_risks: true,
        f_accurate_history: true,
        f_sig_name: 'Johnathan Doe'
      }
    },
    {
      id: 'sub_3',
      templateId: 'form_template_intake',
      patientId: 'pat_2',
      submittedAt: getRelativeDate(0) + 'T08:30:00Z',
      status: 'COMPLETED',
      data: {
        f_emergency_name: 'David Smith',
        f_emergency_phone: '+1 (555) 789-9876',
        f_allergies: 'None.',
        f_medications: 'Claritin for seasonal allergies.',
        f_smoker: 'Socially'
      }
    }
  ],
  invoices: [
    {
      id: 'inv_1001',
      patientId: 'pat_1',
      appointmentId: 'apt_1',
      issuedAt: getRelativeDate(0),
      dueDate: getRelativeDate(15),
      status: 'UNPAID',
      items: [
        { description: 'Dental Cleaning & Prophylaxis (Service)', quantity: 1, unitPrice: 120 },
        { description: 'Fluoride Treatment Premium Varnish', quantity: 1, unitPrice: 35 }
      ],
      payments: [],
      totalAmount: 155,
      notes: 'Sent via patient email portal. Insurance copay pending.'
    },
    {
      id: 'inv_1002',
      patientId: 'pat_2',
      appointmentId: 'apt_6',
      issuedAt: getRelativeDate(-5),
      dueDate: getRelativeDate(10),
      status: 'PAID',
      items: [
        { description: 'Root Canal Treatment (Service)', quantity: 1, unitPrice: 850 },
        { description: 'Local Anesthetics & Sedation Core Fee', quantity: 1, unitPrice: 150 }
      ],
      payments: [
        { amount: 1000, date: getRelativeDate(-5), method: 'CARD' }
      ],
      totalAmount: 1000,
      notes: 'Paid in full on checkout. Receipt generated.'
    },
    {
      id: 'inv_1003',
      patientId: 'pat_3',
      appointmentId: 'apt_3',
      issuedAt: getRelativeDate(0),
      dueDate: getRelativeDate(10),
      status: 'PARTIALLY_PAID',
      items: [
        { description: 'Composite Dental Filling (Service)', quantity: 1, unitPrice: 175 },
        { description: 'Co-pay Patient Balance Due', quantity: 1, unitPrice: 50 }
      ],
      payments: [
        { amount: 50, date: getRelativeDate(0), method: 'CASH' }
      ],
      totalAmount: 225,
      notes: 'Patient paid cash copay. Remaining balance submitted to Delta Dental.'
    }
  ],
  notifications: [
    {
      id: 'not_1',
      userId: 'user_admin',
      title: 'New Online Booking',
      message: 'John Doe has requested an appointment for Professional Teeth Whitening on Jul 13th.',
      read: false,
      timestamp: getRelativeDate(0) + 'T07:12:00Z'
    },
    {
      id: 'not_2',
      userId: 'user_reception',
      title: 'Form Submitted',
      message: 'Emily Smith completed the Intake Form in the lobby.',
      read: false,
      timestamp: getRelativeDate(0) + 'T08:31:00Z'
    },
    {
      id: 'not_3',
      userId: 'user_dentist_1',
      title: 'Patient Checked In',
      message: 'Emily Smith (10:30 appointment) is checked in and in Chair B.',
      read: true,
      timestamp: getRelativeDate(0) + 'T10:28:00Z'
    }
  ],
  settings: {
    name: 'DentProSuite Dental Clinic',
    phone: '+1 (555) 100-3000',
    email: 'info@dentprosuite.com',
    address: '100 Medical Arts Parkway, Suite 400, Portland, OR 97201',
    operatingHours: {
      monday: { open: '08:00', close: '17:00', active: true },
      tuesday: { open: '08:00', close: '17:00', active: true },
      wednesday: { open: '08:00', close: '17:00', active: true },
      thursday: { open: '08:00', close: '17:00', active: true },
      friday: { open: '08:00', close: '16:00', active: true },
      saturday: { open: '09:00', close: '13:00', active: false },
      sunday: { open: '09:00', close: '13:00', active: false }
    },
    chairs: ['Chair A', 'Chair B', 'Chair C'],
    autoSync: true,
    offlineMode: false,
    appwriteConfig: {
      endpoint: 'https://cloud.appwrite.io/v1',
      projectId: 'dentprosuite-primary',
      connected: false
    }
  },
  syncState: {
    lastSyncedAt: getRelativeDate(0) + ' 15:30',
    status: 'synced',
    pendingChangesCount: 0
  }
};

const SEED_CLINICS: Clinic[] = [
  {
    id: 'clinic_primary',
    name: 'DentProSuite Dental Clinic',
    phone: '+1 (555) 100-3000',
    email: 'info@dentprosuite.com',
    address: '100 Medical Arts Parkway, Suite 400, Portland, OR 97201',
    subscriptionTier: 'PREMIUM',
    subscriptionStatus: 'ACTIVE',
    monthlyPrice: 99,
    nextBillingDate: '2026-08-11'
  },
  {
    id: 'clinic_metro',
    name: 'Metro Dental Partners',
    phone: '+1 (555) 234-5678',
    email: 'metro@dentprosuite.com',
    address: '456 Broadway Blvd, Suite 10, Seattle, WA 98101',
    subscriptionTier: 'BASIC',
    subscriptionStatus: 'TRIAL',
    monthlyPrice: 49,
    nextBillingDate: '2026-07-28'
  }
];

class LocalDatabase {
  private state: DatabaseState;

  constructor() {
    // Ensure clinics list is initialized in localStorage
    this.getClinics();
    this.state = this.loadState();
  }

  getClinics(): Clinic[] {
    const stored = localStorage.getItem('dentprosuite_clinics_list');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse clinics list', e);
      }
    }
    localStorage.setItem('dentprosuite_clinics_list', JSON.stringify(SEED_CLINICS));
    return JSON.parse(JSON.stringify(SEED_CLINICS));
  }

  saveClinics(clinics: Clinic[]): void {
    localStorage.setItem('dentprosuite_clinics_list', JSON.stringify(clinics));
  }

  getCurrentClinicId(): string {
    return localStorage.getItem('dentprosuite_current_clinic_id') || 'clinic_primary';
  }

  getCurrentClinic(): Clinic {
    const list = this.getClinics();
    const currentId = this.getCurrentClinicId();
    return list.find(c => c.id === currentId) || list[0] || SEED_CLINICS[0];
  }

  private loadState(): DatabaseState {
    const currentId = this.getCurrentClinicId();
    return this.loadStateForClinic(currentId);
  }

  private loadStateForClinic(clinicId: string, clinicInfo?: Clinic): DatabaseState {
    const key = `dentprosuite_db_state_clinic_${clinicId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse clinic storage, resetting', e);
    }

    // Fallback: check if we are loading the primary clinic and have general STORAGE_KEY
    if (clinicId === 'clinic_primary') {
      try {
        const storedOld = localStorage.getItem(STORAGE_KEY);
        if (storedOld) {
          localStorage.setItem(key, storedOld);
          return JSON.parse(storedOld);
        }
      } catch (e) {}
    }

    // Initialize fresh state for this clinic
    const info = clinicInfo || this.getClinics().find(c => c.id === clinicId) || SEED_CLINICS[0];
    const newState: DatabaseState = JSON.parse(JSON.stringify(INITIAL_STATE));
    
    // Customize settings with clinic info
    newState.settings.name = info.name;
    newState.settings.phone = info.phone;
    newState.settings.email = info.email;
    newState.settings.address = info.address;

    if (clinicId === 'clinic_metro') {
      newState.patients = [
        {
          id: 'pat_metro_1',
          firstName: 'Alice',
          lastName: 'Cooper',
          email: 'alice.cooper@example.com',
          phone: '+1 (555) 999-8888',
          dob: '1970-02-04',
          gender: 'Female',
          address: '99 Rock N Roll Way, Detroit, MI',
          medicalHistory: [],
          emergencyContact: 'Sheryl Cooper (+1 (555) 999-7777)',
          notes: 'Prefers afternoon spots. Loyal long-time patient.',
          createdAt: '2026-02-15'
        }
      ];
      newState.appointments = [
        {
          id: 'apt_metro_1',
          patientId: 'pat_metro_1',
          dentistId: 'user_dentist_1',
          date: getRelativeDate(0), // Today
          time: '14:00',
          duration: 30,
          status: 'SCHEDULED',
          serviceId: 'srv_1',
          notes: 'Consultation',
          chairId: 'Chair A'
        }
      ];
      newState.invoices = [];
    }

    localStorage.setItem(key, JSON.stringify(newState));
    return newState;
  }

  private saveState(): void {
    const currentId = this.getCurrentClinicId();
    const key = `dentprosuite_db_state_clinic_${currentId}`;
    try {
      localStorage.setItem(key, JSON.stringify(this.state));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  switchClinic(clinicId: string): void {
    this.saveState();
    localStorage.setItem('dentprosuite_current_clinic_id', clinicId);
    this.state = this.loadStateForClinic(clinicId);
    this.saveState();
  }

  addClinic(name: string, phone: string, email: string, address: string, tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'): Clinic {
    const clinics = this.getClinics();
    const id = `clinic_${Date.now()}`;
    const priceMap = {
      'BASIC': 49,
      'PREMIUM': 99,
      'ENTERPRISE': 249
    };
    
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const nextBillingDate = d.toISOString().split('T')[0];

    const newClinic: Clinic = {
      id,
      name,
      phone,
      email,
      address,
      subscriptionTier: tier,
      subscriptionStatus: 'ACTIVE',
      monthlyPrice: priceMap[tier],
      nextBillingDate
    };

    clinics.push(newClinic);
    this.saveClinics(clinics);

    this.switchClinic(id);
    return newClinic;
  }

  updateClinicSubscription(clinicId: string, updates: Partial<Clinic>): void {
    const clinics = this.getClinics();
    const idx = clinics.findIndex(c => c.id === clinicId);
    if (idx !== -1) {
      clinics[idx] = { ...clinics[idx], ...updates };
      this.saveClinics(clinics);
    }
  }

  // --- Patients API ---
  getPatients(): Patient[] {
    return this.state.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.state.patients.find(p => p.id === id);
  }

  addPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const newPatient: Patient = {
      ...patient,
      id: `pat_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.state.patients.unshift(newPatient);
    this.incrementPendingChanges();
    this.saveState();
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient {
    const idx = this.state.patients.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Patient not found');
    this.state.patients[idx] = { ...this.state.patients[idx], ...updates };
    this.incrementPendingChanges();
    this.saveState();
    return this.state.patients[idx];
  }

  deletePatient(id: string): void {
    this.state.patients = this.state.patients.filter(p => p.id !== id);
    this.state.appointments = this.state.appointments.filter(a => a.patientId !== id);
    this.state.invoices = this.state.invoices.filter(i => i.patientId !== id);
    this.incrementPendingChanges();
    this.saveState();
  }

  // --- Appointments API ---
  getAppointments(): Appointment[] {
    return this.state.appointments;
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.state.appointments.find(a => a.id === id);
  }

  addAppointment(apt: Omit<Appointment, 'id'>): Appointment {
    const newApt: Appointment = {
      ...apt,
      id: `apt_${Date.now()}`
    };
    this.state.appointments.push(newApt);
    this.incrementPendingChanges();
    
    // Auto-create invoice for this appointment
    const svc = this.getServiceById(apt.serviceId);
    if (svc) {
      this.addInvoice({
        patientId: apt.patientId,
        appointmentId: newApt.id,
        issuedAt: apt.date,
        dueDate: getRelativeDate(15), // due 15 days later
        items: [
          { description: `${svc.name} (Service Rendered)`, quantity: 1, unitPrice: svc.price }
        ],
        status: 'UNPAID',
        payments: [],
        notes: `Automatically generated billing record for appointment ID ${newApt.id}`
      });
    }

    this.saveState();
    return newApt;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment {
    const idx = this.state.appointments.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');
    const oldStatus = this.state.appointments[idx].status;
    this.state.appointments[idx] = { ...this.state.appointments[idx], ...updates };
    
    // Add real notification if status changed to Checked In
    if (updates.status === 'CHECKED_IN' && oldStatus !== 'CHECKED_IN') {
      const pat = this.getPatientById(this.state.appointments[idx].patientId);
      if (pat) {
        this.addNotification({
          userId: 'user_dentist_1', // Notify primary dentist
          title: 'Patient Checked In',
          message: `${pat.firstName} ${pat.lastName} has checked in for appointment at ${this.state.appointments[idx].time}.`
        });
        this.addNotification({
          userId: 'user_reception',
          title: 'Patient Checked In',
          message: `${pat.firstName} ${pat.lastName} is ready and waiting.`
        });
      }
    }

    this.incrementPendingChanges();
    this.saveState();
    return this.state.appointments[idx];
  }

  deleteAppointment(id: string): void {
    this.state.appointments = this.state.appointments.filter(a => a.id !== id);
    this.state.invoices = this.state.invoices.filter(i => i.appointmentId !== id);
    this.incrementPendingChanges();
    this.saveState();
  }

  // --- Services API ---
  getServices(): Service[] {
    return this.state.services;
  }

  getServiceById(id: string): Service | undefined {
    return this.state.services.find(s => s.id === id);
  }

  // --- Forms API ---
  getFormTemplates(): FormTemplate[] {
    return this.state.formTemplates;
  }

  getFormTemplateById(id: string): FormTemplate | undefined {
    return this.state.formTemplates.find(f => f.id === id);
  }

  addFormTemplate(template: Omit<FormTemplate, 'id' | 'createdAt'>): FormTemplate {
    const newTemplate: FormTemplate = {
      ...template,
      id: `form_template_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.state.formTemplates.push(newTemplate);
    this.incrementPendingChanges();
    this.saveState();
    return newTemplate;
  }

  getFormSubmissions(): FormSubmission[] {
    return this.state.formSubmissions;
  }

  addFormSubmission(sub: Omit<FormSubmission, 'id' | 'submittedAt'>): FormSubmission {
    const newSub: FormSubmission = {
      ...sub,
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString()
    };
    this.state.formSubmissions.unshift(newSub);
    this.incrementPendingChanges();
    this.saveState();
    return newSub;
  }

  // --- Billing API ---
  getInvoices(): Invoice[] {
    return this.state.invoices;
  }

  addInvoice(invoice: Omit<Invoice, 'id' | 'totalAmount'>): Invoice {
    const totalAmount = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv_${1000 + this.state.invoices.length + 1}`,
      totalAmount
    };
    this.state.invoices.unshift(newInvoice);
    this.incrementPendingChanges();
    this.saveState();
    return newInvoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice {
    const idx = this.state.invoices.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Invoice not found');
    
    const existing = this.state.invoices[idx];
    const updated = { ...existing, ...updates };
    
    // Recalculate total if items updated
    if (updates.items) {
      updated.totalAmount = updates.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }
    
    // Auto status adjust based on payments
    if (updates.payments) {
      const paidAmt = updated.payments.reduce((acc, pay) => acc + pay.amount, 0);
      if (paidAmt >= updated.totalAmount) {
        updated.status = 'PAID';
      } else if (paidAmt > 0) {
        updated.status = 'PARTIALLY_PAID';
      } else {
        updated.status = 'UNPAID';
      }
    }

    this.state.invoices[idx] = updated;
    this.incrementPendingChanges();
    this.saveState();
    return updated;
  }

  deleteInvoice(id: string): void {
    this.state.invoices = this.state.invoices.filter(i => i.id !== id);
    this.incrementPendingChanges();
    this.saveState();
  }

  // --- Notifications API ---
  getNotifications(userId: string): Notification[] {
    return this.state.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  addNotification(notif: Omit<Notification, 'id' | 'read' | 'timestamp'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `not_${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString()
    };
    this.state.notifications.unshift(newNotif);
    this.saveState();
    return newNotif;
  }

  markNotificationAsRead(id: string): void {
    const notif = this.state.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveState();
    }
  }

  // --- Settings API ---
  getSettings(): ClinicSettings {
    return this.state.settings;
  }

  updateSettings(updates: Partial<ClinicSettings>): ClinicSettings {
    this.state.settings = { ...this.state.settings, ...updates };
    this.incrementPendingChanges();
    this.saveState();
    return this.state.settings;
  }

  // --- Sync State API ---
  getSyncState(): SyncState {
    return this.state.syncState;
  }

  private incrementPendingChanges(): void {
    this.state.syncState.pendingChangesCount += 1;
    this.state.syncState.status = 'offline';
  }

  triggerMockSync(onSuccess: () => void, onFailure?: (msg: string) => void): void {
    if (this.state.syncState.status === 'syncing') return;

    this.state.syncState.status = 'syncing';
    this.saveState();

    // Mock network lag
    setTimeout(() => {
      // 90% chance of clean sync, 10% chance of fake offline mode
      if (Math.random() > 0.1) {
        this.state.syncState.status = 'synced';
        this.state.syncState.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';
        this.state.syncState.pendingChangesCount = 0;
        this.saveState();
        onSuccess();
      } else {
        this.state.syncState.status = 'error';
        this.saveState();
        if (onFailure) onFailure('Temporary network handshake failed. Retrying in background...');
      }
    }, 1500);
  }

  resetToFactoryDefaults(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.saveState();
  }

  replaceAllPatients(data: Patient[]): void {
    this.state.patients = data;
    this.saveState();
  }

  replaceAllAppointments(data: Appointment[]): void {
    this.state.appointments = data;
    this.saveState();
  }

  replaceAllInvoices(data: Invoice[]): void {
    this.state.invoices = data;
    this.saveState();
  }

  replaceAllFormTemplates(data: FormTemplate[]): void {
    this.state.formTemplates = data;
    this.saveState();
  }

  replaceAllFormSubmissions(data: FormSubmission[]): void {
    this.state.formSubmissions = data;
    this.saveState();
  }

  replaceAllNotifications(data: Notification[]): void {
    this.state.notifications = data;
    this.saveState();
  }
}

export const db = new LocalDatabase();

// Current active session tracking in memory and localStorage for routing
const SESSION_KEY = 'dentprosuite_session';

export function getActiveSession(): Session | null {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (sessionData) {
    try {
      return JSON.parse(sessionData);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setActiveSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}
