import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Session, SyncState, Patient, Appointment, Invoice, 
  FormTemplate, FormSubmission, Notification, ClinicSettings, Clinic 
} from '../types';
import { db, getActiveSession, setActiveSession, SEED_USERS } from '../services/db';
import { DataService } from '../services/api';
import { addAuditLog } from '../services/auditLogger';
import { syncQueue } from '../services/offlineStorage';

const patientApi = new DataService('/api/patients');
const appointmentApi = new DataService('/api/appointments');
const invoiceApi = new DataService('/api/invoices');
const formTemplateApi = new DataService('/api/forms/templates');
const formSubmissionApi = new DataService('/api/forms/submissions');
const notificationApi = new DataService('/api/notifications');
const settingsApi = new DataService('/api/settings');

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
  loginWithUser: (user: User) => void;
  logout: () => void;
  refreshState: () => void;
  triggerSync: () => void;
  switchClinic: (clinicId: string) => void;
  registerClinic: (name: string, phone: string, email: string, address: string, tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE') => Clinic;
  updateClinicSubscription: (clinicId: string, updates: Partial<Clinic>) => void;
  
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
  const [session, setSession] = useState<Session | null>(getActiveSession());
  const [currentRoute, setCurrentRoute] = useState<string>('login');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  
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

  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    window.location.hash = route + (Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '');
    setCurrentRoute(route);
    setRouteParams(params);
  };

  const syncLocalState = useCallback(() => {
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
  }, [session]);

  const refreshState = useCallback(() => {
    syncLocalState();

    const token = localStorage.getItem('token');
    if (navigator.onLine && token) {
      Promise.allSettled([
        patientApi.getAll().then(data => { if (data?.length) { db.replaceAllPatients(data); syncLocalState(); } }),
        appointmentApi.getAll().then(data => { if (data?.length) { db.replaceAllAppointments(data); syncLocalState(); } }),
        invoiceApi.getAll().then(data => { if (data?.length) { db.replaceAllInvoices(data); syncLocalState(); } }),
        formTemplateApi.getAll().then(data => { if (data?.length) { db.replaceAllFormTemplates(data); syncLocalState(); } }),
        formSubmissionApi.getAll().then(data => { if (data?.length) { db.replaceAllFormSubmissions(data); syncLocalState(); } }),
        settingsApi.getAll().then(data => { if (data?.length) { db.updateSettings(data[0]); syncLocalState(); } }),
        ...(session ? [notificationApi.getAll({ userId: session.user.id }).then(data => { if (data) { db.replaceAllNotifications(data); syncLocalState(); } })] : [])
      ]).catch(() => {});
    }
  }, [syncLocalState, session]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const [routePart, queryPart] = hash.split('?');
      
      const route = routePart || 'login';
      const params: Record<string, string> = {};
      
      if (queryPart) {
        const searchParams = new URLSearchParams(queryPart);
        searchParams.forEach((val, key) => { params[key] = val; });
      }

      const currentSession = getActiveSession();
      
      if (route === 'public-booking' || route === 'public-confirmation') {
        setCurrentRoute(route);
        setRouteParams(params);
        return;
      }

      if (!currentSession) {
        setSession(null);
        setCurrentRoute('login');
        setRouteParams({});
        window.location.hash = 'login';
      } else {
        setSession(currentSession);
        
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

    handleHashChange();
    syncLocalState();
    refreshState();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    syncLocalState();
  }, [session, syncLocalState]);

  const login = (email: string, role: string): boolean => {
    const matched = SEED_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );
    if (matched) {
      const newSession: Session = { user: matched };
      if (role === 'PATIENT') newSession.patientId = 'pat_1';
      setActiveSession(newSession);
      setSession(newSession);
      
      let dest = 'admin-dashboard';
      if (role === 'RECEPTION') dest = 'reception-dashboard';
      if (role === 'DENTIST') dest = 'dentist-dashboard';
      if (role === 'PATIENT') dest = 'patient-dashboard';
      
      navigateTo(dest);
      setTimeout(refreshState, 0);
      return true;
    }
    return false;
  };

  const loginWithUser = (user: User) => {
    const newSession: Session = { user };
    if (user.role === 'PATIENT') newSession.patientId = 'pat_1';
    setActiveSession(newSession);
    setSession(newSession);
    
    let dest = 'admin-dashboard';
    if (user.role === 'RECEPTION') dest = 'reception-dashboard';
    if (user.role === 'DENTIST') dest = 'dentist-dashboard';
    if (user.role === 'PATIENT') dest = 'patient-dashboard';
    
    navigateTo(dest);
    setTimeout(refreshState, 0);
  };

  const logout = () => {
    setActiveSession(null);
    setSession(null);
    navigateTo('login');
    syncLocalState();
  };

  const triggerSync = () => {
    db.triggerMockSync(
      () => { refreshState(); },
      (errMsg) => { refreshState(); console.warn(errMsg); }
    );
    syncLocalState();
    syncQueue().catch(() => {});
  };

  const addPatient = (patient: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPat = db.addPatient(patient);
    addAuditLog('CREATE_PATIENT', `Registered new patient: ${newPat.firstName} ${newPat.lastName} (ID: ${newPat.id})`);
    syncLocalState();
    patientApi.create({ ...patient, id: newPat.id, createdAt: newPat.createdAt }).catch(() => {});
    return newPat;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const updated = db.updatePatient(id, updates);
    addAuditLog('UPDATE_PATIENT', `Updated patient: ${updated.firstName} ${updated.lastName} (ID: ${updated.id})`);
    syncLocalState();
    patientApi.update(id, updates).catch(() => {});
    return updated;
  };

  const deletePatient = (id: string) => {
    const pat = db.getPatientById(id);
    const name = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${id}`;
    db.deletePatient(id);
    addAuditLog('DELETE_PATIENT_RECORD', `Deleted patient: ${name} (ID: ${id})`);
    syncLocalState();
    patientApi.update(id, {} as any).catch(() => {});
  };

  const addAppointment = (apt: Omit<Appointment, 'id'>) => {
    const newApt = db.addAppointment(apt);
    const pat = db.getPatientById(apt.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${apt.patientId}`;
    addAuditLog('CREATE_APPOINTMENT', `Booked appointment for ${patName} on ${newApt.date} at ${newApt.time}`);
    syncLocalState();
    appointmentApi.create({ ...apt, id: newApt.id }).catch(() => {});
    return newApt;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const oldApt = db.getAppointmentById(id);
    const updated = db.updateAppointment(id, updates);
    const pat = db.getPatientById(updated.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${updated.patientId}`;
    
    if (updates.status && updates.status !== oldApt?.status) {
      addAuditLog('UPDATE_APPOINTMENT_STATUS', `Updated status for ${patName} to: ${updates.status}`);
    } else {
      addAuditLog('UPDATE_APPOINTMENT', `Updated appointment for ${patName} on ${updated.date}`);
    }
    
    syncLocalState();
    appointmentApi.update(id, updates).catch(() => {});
    return updated;
  };

  const deleteAppointment = (id: string) => {
    const apt = db.getAppointmentById(id);
    if (apt) {
      const pat = db.getPatientById(apt.patientId);
      const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${apt.patientId}`;
      db.deleteAppointment(id);
      addAuditLog('DELETE_APPOINTMENT', `Cancelled appointment for ${patName} on ${apt.date}`);
    }
    syncLocalState();
    appointmentApi.update(id, {} as any).catch(() => {});
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'totalAmount'>) => {
    const newInv = db.addInvoice(invoice);
    const pat = db.getPatientById(invoice.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${invoice.patientId}`;
    addAuditLog('CREATE_INVOICE', `Created invoice #${newInv.id} for ${patName} ($${newInv.totalAmount})`);
    syncLocalState();
    invoiceApi.create({ ...invoice, id: newInv.id, totalAmount: newInv.totalAmount }).catch(() => {});
    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const oldInv = db.getInvoices().find(i => i.id === id);
    const updated = db.updateInvoice(id, updates);
    const pat = db.getPatientById(updated.patientId);
    const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${updated.patientId}`;
    
    if (updates.payments && updates.payments.length > (oldInv?.payments.length || 0)) {
      const latestPayment = updates.payments[updates.payments.length - 1];
      addAuditLog('PROCESS_PAYMENT', `Payment of $${latestPayment.amount} via ${latestPayment.method} for invoice #${id} (${patName})`);
    } else {
      addAuditLog('UPDATE_INVOICE_LEDGER', `Updated invoice #${id} for ${patName}`);
    }
    
    syncLocalState();
    invoiceApi.update(id, updates).catch(() => {});
    return updated;
  };

  const deleteInvoice = (id: string) => {
    const inv = db.getInvoices().find(i => i.id === id);
    if (inv) {
      const pat = db.getPatientById(inv.patientId);
      const patName = pat ? `${pat.firstName} ${pat.lastName}` : `ID ${inv.patientId}`;
      db.deleteInvoice(id);
      addAuditLog('DELETE_INVOICE_RECORD', `Deleted invoice #${id} for ${patName} ($${inv.totalAmount})`);
    }
    syncLocalState();
    invoiceApi.update(id, {} as any).catch(() => {});
  };

  const addFormSubmission = (sub: Omit<FormSubmission, 'id' | 'submittedAt'>) => {
    const newSub = db.addFormSubmission(sub);
    db.addNotification({
      userId: 'user_reception',
      title: 'New Patient Intake Submitted',
      message: 'Intake form details were logged. Open Form Submissions to view.'
    });
    syncLocalState();
    formSubmissionApi.create({ ...sub, id: newSub.id, submittedAt: newSub.submittedAt }).catch(() => {});
    return newSub;
  };

  const addFormTemplate = (template: Omit<FormTemplate, 'id' | 'createdAt'>) => {
    const newTemplate = db.addFormTemplate(template);
    syncLocalState();
    formTemplateApi.create({ ...template, id: newTemplate.id, createdAt: newTemplate.createdAt }).catch(() => {});
    return newTemplate;
  };

  const markNotificationRead = (id: string) => {
    db.markNotificationAsRead(id);
    syncLocalState();
    notificationApi.update(id, { read: true }).catch(() => {});
  };

  const updateSettings = (updates: Partial<ClinicSettings>) => {
    const updated = db.updateSettings(updates);
    addAuditLog('UPDATE_CLINIC_SETTINGS', `Updated clinic settings`);
    syncLocalState();
    settingsApi.update('settings_default', updates).catch(() => {});
    return updated;
  };

  const switchClinic = (clinicId: string) => {
    db.switchClinic(clinicId);
    syncLocalState();
    refreshState();
  };

  const registerClinic = (name: string, phone: string, email: string, address: string, tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE') => {
    const newClinic = db.addClinic(name, phone, email, address, tier);
    addAuditLog('REGISTER_NEW_CLINIC', `Registered clinic: ${name} (${tier} tier)`);
    syncLocalState();
    return newClinic;
  };

  const updateClinicSubscription = (clinicId: string, updates: Partial<Clinic>) => {
    db.updateClinicSubscription(clinicId, updates);
    const targetClinic = db.getClinics().find(c => c.id === clinicId);
    const clinicName = targetClinic ? targetClinic.name : `ID ${clinicId}`;
    addAuditLog('UPDATE_SUBSCRIPTION_BILLING', `Updated subscription for ${clinicName}`);
    syncLocalState();
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
      loginWithUser,
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
