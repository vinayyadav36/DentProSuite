import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Session, SyncState, Patient, Appointment, Invoice, 
  FormTemplate, FormSubmission, Notification, ClinicSettings, Clinic 
} from '../types';
import { db, getActiveSession, setActiveSession, SEED_USERS } from '../services/db';
import { addAuditLog } from '../services/auditLogger';

interface AppContextType {
  session: Session | null;
  currentRoute: string;
  routeParams: Record<string, string>;
  syncState: SyncState;
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  formTemplates: FormTemplate[];
  formSubmissions: FormSubmission[];
  notifications: Notification[];
  settings: ClinicSettings;
  clinics: Clinic[];
  currentClinic: Clinic;
  navigateTo: (route: string, params?: Record<string, string>) => void;
  login: (email: string, role: string) => boolean;
  logout: () => void;
  refreshState: () => void;
  triggerSync: () => void;
  switchClinic: (clinicId: string) => void;
  registerClinic: (name: string, phone: string, email: string, address: string, tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE') => Clinic;
  updateClinicSubscription: (clinicId: string, updates: Partial<Clinic>) => void;
  
  // High-level operations
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => Patient;
  deletePatient: (id: string) => void;
  addAppointment: (apt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Appointment;
  deleteAppointment: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'totalAmount'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Invoice;
  deleteInvoice: (id: string) => void;
  addFormSubmission: (sub: Omit<FormSubmission, 'id' | 'submittedAt'>) => FormSubmission;
  addFormTemplate: (template: Omit<FormTemplate, 'id' | 'createdAt'>) => FormTemplate;
  markNotificationRead: (id: string) => void;
  updateSettings: (updates: Partial<ClinicSettings>) => ClinicSettings;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session & Router
  const [session, setSession] = useState<Session | null>(getActiveSession());
  const [currentRoute, setCurrentRoute] = useState<string>('login');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  
  // Database States (mirrored in react state for reactive re-renders)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<ClinicSettings>(db.getSettings());
  const [syncState, setSyncState] = useState<SyncState>(db.getSyncState());
  const [clinics, setClinics] = useState<Clinic[]>(db.getClinics());
  const [currentClinic, setCurrentClinic] = useState<Clinic>(db.getCurrentClinic());

  // Navigation controller with role guards
  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    // Check if hash matches
    window.location.hash = route + (Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '');
    setCurrentRoute(route);
    setRouteParams(params);
  };

  // Sync state with localstorage state on load and during operations
  const refreshState = () => {
    setPatients([...db.getPatients()]);
    setAppointments([...db.getAppointments()]);
    setInvoices([...db.getInvoices()]);
    setFormTemplates([...db.getFormTemplates()]);
    setFormSubmissions([...db.getFormSubmissions()]);
    setSettings({ ...db.getSettings() });
    setSyncState({ ...db.getSyncState() });
    setClinics([...db.getClinics()]);
    setCurrentClinic({ ...db.getCurrentClinic() });
    
    if (session) {
      setNotifications([...db.getNotifications(session.user.id)]);
    } else {
      setNotifications([]);
    }
  };

  // Initialize and handle popstate (browser back/forward in SPA mode)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const [routePart, queryPart] = hash.split('?');
      
      const route = routePart || 'login';
      const params: Record<string, string> = {};
      
      if (queryPart) {
        const searchParams = new URLSearchParams(queryPart);
        searchParams.forEach((val, key) => {
          params[key] = val;
        });
      }

      // Check access permission guards
      const currentSession = getActiveSession();
      
      // Allow public booking route without auth
      if (route === 'public-booking' || route === 'public-confirmation') {
        setCurrentRoute(route);
        setRouteParams(params);
        return;
      }

      if (!currentSession) {
        // Force redirect to login
        setSession(null);
        setCurrentRoute('login');
        setRouteParams({});
        window.location.hash = 'login';
      } else {
        // Enforce role dashboards
        setSession(currentSession);
        
        // Auto-correct default route if landing on login or blank
        if (route === 'login' || !routePart) {
          const role = currentSession.user.role;
          let dest = 'admin-dashboard';
          if (role === 'RECEPTION') dest = 'reception-dashboard';
          if (role === 'DENTIST') dest = 'dentist-dashboard';
          if (role === 'PATIENT') dest = 'patient-dashboard';
          
          setCurrentRoute(dest);
          setRouteParams({});
          window.location.hash = dest;
        } else {
          setCurrentRoute(route);
          setRouteParams(params);
        }
      }
    };

    // Load initial hash
    handleHashChange();
    refreshState();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update notification whenever session changes
  useEffect(() => {
    if (session) {
      setNotifications([...db.getNotifications(session.user.id)]);
    } else {
      setNotifications([]);
    }
  }, [session]);

  const login = (email: string, role: string): boolean => {
    const matched = SEED_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );
    if (matched) {
      const newSession: Session = { user: matched };
      if (role === 'PATIENT') {
        // John Doe is default pat_1 patient
        newSession.patientId = 'pat_1';
      }
      setActiveSession(newSession);
      setSession(newSession);
      
      // Redirect based on role
      let dest = 'admin-dashboard';
      if (role === 'RECEPTION') dest = 'reception-dashboard';
      if (role === 'DENTIST') dest = 'dentist-dashboard';
      if (role === 'PATIENT') dest = 'patient-dashboard';
      
      navigateTo(dest);
      refreshState();
      return true;
    }
    return false;
  };

  const logout = () => {
    setActiveSession(null);
    setSession(null);
    navigateTo('login');
    refreshState();
  };

  const triggerSync = () => {
    db.triggerMockSync(
      () => {
        refreshState();
      },
      (errMsg) => {
        refreshState();
        console.warn(errMsg);
      }
    );
    refreshState(); // update status to 'syncing'
  };

  // State-mutating methods wrapping DB with automatic state refresh
  const addPatient = (patient: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPat = db.addPatient(patient);
    addAuditLog('CREATE_PATIENT', `Registered new patient record: ${newPat.firstName} ${newPat.lastName} (ID: ${newPat.id})`);
    refreshState();
    return newPat;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const updated = db.updatePatient(id, updates);
    addAuditLog('UPDATE_PATIENT', `Updated clinic demographics for patient: ${updated.firstName} ${updated.lastName} (ID: ${updated.id})`);
    refreshState();
    return updated;
  };

  const deletePatient = (id: string) => {
    const pat = db.getPatientById(id);
    const name = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${id}`;
    db.deletePatient(id);
    addAuditLog('DELETE_PATIENT_RECORD', `Permanently deleted patient demographics and clinical history for: ${name} (ID: ${id})`);
    refreshState();
  };

  const addAppointment = (apt: Omit<Appointment, 'id'>) => {
    const newApt = db.addAppointment(apt);
    const pat = db.getPatientById(apt.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${apt.patientId}`;
    addAuditLog('CREATE_APPOINTMENT', `Booked new clinical appointment slot for ${patName} on ${newApt.date} at ${newApt.time} (Chair: ${newApt.chairId})`);
    refreshState();
    return newApt;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const oldApt = db.getAppointmentById(id);
    const updated = db.updateAppointment(id, updates);
    const pat = db.getPatientById(updated.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${updated.patientId}`;
    
    if (updates.status && updates.status !== oldApt?.status) {
      addAuditLog('UPDATE_APPOINTMENT_STATUS', `Modified appointment status for ${patName} on ${updated.date} to: ${updates.status}`);
    } else {
      addAuditLog('UPDATE_APPOINTMENT', `Modified clinical scheduling details for patient ${patName} on ${updated.date}`);
    }
    
    refreshState();
    return updated;
  };

  const deleteAppointment = (id: string) => {
    const apt = db.getAppointmentById(id);
    if (apt) {
      const pat = db.getPatientById(apt.patientId);
      const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${apt.patientId}`;
      db.deleteAppointment(id);
      addAuditLog('DELETE_APPOINTMENT', `Cancelled and removed clinical appointment for ${patName} on ${apt.date} at ${apt.time}`);
    }
    refreshState();
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'totalAmount'>) => {
    const newInv = db.addInvoice(invoice);
    const pat = db.getPatientById(invoice.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${invoice.patientId}`;
    addAuditLog('CREATE_INVOICE', `Generated new ledger billing statement #${newInv.id} for ${patName} (Total Statement: $${newInv.totalAmount})`);
    refreshState();
    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const oldInv = db.getInvoices().find(i => i.id === id);
    const updated = db.updateInvoice(id, updates);
    const pat = db.getPatientById(updated.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${updated.patientId}`;
    
    if (updates.payments && updates.payments.length > (oldInv?.payments.length || 0)) {
      const latestPayment = updates.payments[updates.payments.length - 1];
      addAuditLog('PROCESS_PAYMENT', `Log billing payment of $${latestPayment.amount} via ${latestPayment.method} for invoice #${id}. Patient profile: ${patName}`);
    } else {
      addAuditLog('UPDATE_INVOICE_LEDGER', `Modified ledger billing statement details for #${id} associated with ${patName}`);
    }
    
    refreshState();
    return updated;
  };

  const deleteInvoice = (id: string) => {
    const inv = db.getInvoices().find(i => i.id === id);
    if (inv) {
      const pat = db.getPatientById(inv.patientId);
      const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${inv.patientId}`;
      db.deleteInvoice(id);
      addAuditLog('DELETE_INVOICE_RECORD', `Deleted invoice statement #${id} for ${patName} (Amount: $${inv.totalAmount})`);
    }
    refreshState();
  };

  const addFormSubmission = (sub: Omit<FormSubmission, 'id' | 'submittedAt'>) => {
    const newSub = db.addFormSubmission(sub);
    
    // Create notification for receptionist/dentists
    db.addNotification({
      userId: 'user_reception',
      title: 'New Patient Intake Submitted',
      message: 'Intake form details were logged. Open Form Submissions to view.'
    });

    refreshState();
    return newSub;
  };

  const addFormTemplate = (template: Omit<FormTemplate, 'id' | 'createdAt'>) => {
    const newTemplate = db.addFormTemplate(template);
    refreshState();
    return newTemplate;
  };

  const markNotificationRead = (id: string) => {
    db.markNotificationAsRead(id);
    refreshState();
  };

  const updateSettings = (updates: Partial<ClinicSettings>) => {
    const updated = db.updateSettings(updates);
    addAuditLog('UPDATE_CLINIC_SETTINGS', `Modified clinic general settings (operatory chairs, working hours)`);
    refreshState();
    return updated;
  };

  const switchClinic = (clinicId: string) => {
    db.switchClinic(clinicId);
    refreshState();
  };

  const registerClinic = (name: string, phone: string, email: string, address: string, tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE') => {
    const newClinic = db.addClinic(name, phone, email, address, tier);
    addAuditLog('REGISTER_NEW_CLINIC', `Provisioned new multi-tenant clinic subscription for: ${name} (${tier} tier)`);
    refreshState();
    return newClinic;
  };

  const updateClinicSubscription = (clinicId: string, updates: Partial<Clinic>) => {
    db.updateClinicSubscription(clinicId, updates);
    const targetClinic = db.getClinics().find(c => c.id === clinicId);
    const clinicName = targetClinic ? targetClinic.name : `ID ${clinicId}`;
    addAuditLog('UPDATE_SUBSCRIPTION_BILLING', `Modified SaaS licensing terms for ${clinicName}: ${JSON.stringify(updates)}`);
    refreshState();
  };

  return (
    <AppContext.Provider value={{
      session,
      currentRoute,
      routeParams,
      syncState,
      patients,
      appointments,
      invoices,
      formTemplates,
      formSubmissions,
      notifications,
      settings,
      clinics,
      currentClinic,
      navigateTo,
      login,
      logout,
      refreshState,
      triggerSync,
      switchClinic,
      registerClinic,
      updateClinicSubscription,
      
      addPatient,
      updatePatient,
      deletePatient,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addFormSubmission,
      addFormTemplate,
      markNotificationRead,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
