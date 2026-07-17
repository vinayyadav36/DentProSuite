import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { LoginView } from './views/LoginView';
import { AdminDashboard } from './views/AdminDashboard';
import { ReceptionDashboard } from './views/ReceptionDashboard';
import { DentistDashboard } from './views/DentistDashboard';
import { PatientDashboard } from './views/PatientDashboard';
import { AppointmentManagement } from './views/AppointmentManagement';
import { PatientManagement } from './views/PatientManagement';
import { FormsModule } from './views/FormsModule';
import { BillingModule } from './views/BillingModule';
import { SettingsView } from './views/SettingsView';
import { PublicBookingView } from './views/PublicBookingView';

const NavigationRouter: React.FC = () => {
  const { currentRoute } = useApp();

  // Initialize theme on app load
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const root = window.document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Public views (no layout sidebar wrappers needed)
  if (currentRoute === 'login') {
    return <LoginView />;
  }

  if (currentRoute === 'public-booking') {
    return <PublicBookingView />;
  }

  // Dashboard & Operational views within the responsive sidebar layout
  return (
    <Layout>
      {currentRoute === 'admin-dashboard' && <AdminDashboard />}
      {currentRoute === 'reception-dashboard' && <ReceptionDashboard />}
      {currentRoute === 'dentist-dashboard' && <DentistDashboard />}
      {currentRoute === 'patient-dashboard' && <PatientDashboard />}
      {currentRoute === 'appointments' && <AppointmentManagement />}
      {currentRoute === 'patients' && <PatientManagement />}
      {currentRoute === 'forms' && <FormsModule />}
      {currentRoute === 'billing' && <BillingModule />}
      {currentRoute === 'settings' && <SettingsView />}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <NavigationRouter />
    </AppProvider>
  );
}
