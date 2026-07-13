import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, Calendar, Users, FileText, CreditCard, 
  Settings, LogOut, Bell, RefreshCw, Menu, X, Wifi, WifiOff, CheckCircle2, AlertTriangle, ChevronRight, User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    session, currentRoute, navigateTo, logout, 
    syncState, triggerSync, notifications, markNotificationRead, settings,
    clinics, currentClinic, switchClinic
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!session) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const { user } = session;
  const isPatient = user.role === 'PATIENT';

  // Navigation schema based on role
  const getNavItems = () => {
    const items = [];
    
    // Add correct home dashboard first
    if (user.role === 'ADMIN') {
      items.push({ name: 'Dashboard', route: 'admin-dashboard', icon: LayoutDashboard });
    } else if (user.role === 'RECEPTION') {
      items.push({ name: 'Dashboard', route: 'reception-dashboard', icon: LayoutDashboard });
    } else if (user.role === 'DENTIST') {
      items.push({ name: 'Dashboard', route: 'dentist-dashboard', icon: LayoutDashboard });
    } else if (user.role === 'PATIENT') {
      items.push({ name: 'My Portal', route: 'patient-dashboard', icon: LayoutDashboard });
    }

    if (!isPatient) {
      items.push({ name: 'Appointments', route: 'appointments', icon: Calendar });
      items.push({ name: 'Patients', route: 'patients', icon: Users });
      items.push({ name: 'Forms Intake', route: 'forms', icon: FileText });
      items.push({ name: 'Billing & Ledger', route: 'billing', icon: CreditCard });
      
      if (user.role === 'ADMIN') {
        items.push({ name: 'Clinic Settings', route: 'settings', icon: Settings });
      }
    } else {
      items.push({ name: 'Book Appointment', route: 'public-booking', icon: Calendar });
    }

    return items;
  };

  const navItems = getNavItems();
  const unreadNotifs = notifications.filter(n => !n.read);

  const handleSyncClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerSync();
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-800 border-r border-slate-200 shrink-0">
        <div className="p-5 flex flex-col gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-800 leading-none">
                DentPro<span className="text-[#0EA5E9]">Suite</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">v1.2.0 (SaaS Multi-Clinic)</span>
            </div>
          </div>

          {!isPatient && (
            <div className="mt-1 text-xs">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Clinic Tenant</label>
              <select
                value={currentClinic.id}
                onChange={(e) => switchClinic(e.target.value)}
                id="sidebar-clinic-select"
                className="w-full p-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] text-xs cursor-pointer"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏢 {c.name} {c.subscriptionStatus === 'TRIAL' ? '(Trial)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigateTo(item.route)}
                id={`sidebar-nav-${item.route}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-slate-50 text-[#0EA5E9] font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#0EA5E9]' : 'text-slate-400'} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Card Profile & Session */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold truncate">{user.role}</p>
            </div>
          </div>
          <button 
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-xs font-medium text-slate-500 transition"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
          
          {/* Left menu toggle for mobile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 focus:outline-none"
              id="mobile-menu-open-btn"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3 text-slate-500 text-xs font-mono font-medium">
              <span>{settings.name}</span>
              <ChevronRight size={12} />
              <span className="text-[#0EA5E9] bg-sky-50 px-2.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wide">
                {user.role} Console
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Local-First Active
              </span>
            </div>
            <div className="md:hidden font-bold text-sm text-slate-900 tracking-tight">
              DentProSuite
            </div>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-3">
            
            {/* Sync Indicators */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSyncClick}
                disabled={syncState.status === 'syncing'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border font-medium transition ${
                  syncState.status === 'synced' 
                    ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100' 
                    : syncState.status === 'syncing'
                    ? 'border-sky-200 bg-sky-50/50 text-[#0EA5E9]'
                    : syncState.status === 'error'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-amber-50/30 text-amber-600'
                }`}
                id="sync-toolbar-btn"
                title="Trigger local-to-cloud database sync"
              >
                {syncState.status === 'synced' && <Wifi size={13} className="text-emerald-500" />}
                {syncState.status === 'offline' && <WifiOff size={13} className="text-amber-500" />}
                {syncState.status === 'syncing' && <RefreshCw size={13} className="animate-spin text-[#0EA5E9]" />}
                {syncState.status === 'error' && <AlertTriangle size={13} className="text-amber-500" />}
                
                <span className="hidden sm:inline">
                  {syncState.status === 'synced' && 'Cloud Synced'}
                  {syncState.status === 'offline' && `${syncState.pendingChangesCount} Pending`}
                  {syncState.status === 'syncing' && 'Syncing...'}
                  {syncState.status === 'error' && 'Sync Failure'}
                </span>
              </button>
            </div>

            {/* Notification Hub */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition relative ${notifOpen ? 'bg-slate-100' : ''}`}
                id="notification-hub-btn"
              >
                <Bell size={18} className="text-slate-600" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Recent Alerts</span>
                      {unreadNotifs.length > 0 && (
                        <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                          {unreadNotifs.length} new
                        </span>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No recent alerts to show
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              markNotificationRead(n.id);
                            }}
                            className={`p-3 text-left hover:bg-slate-50 transition cursor-pointer ${!n.read ? 'bg-sky-50/20' : ''}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${!n.read ? 'bg-[#0EA5E9]' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar Trigger (Mini) */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-sky-50 text-[#0EA5E9] flex items-center justify-center font-bold text-xs uppercase border border-sky-100">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer menu backdrop */}
      {mobileMenuOpen && (
        <>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
          />
          <aside className="fixed top-0 bottom-0 left-0 w-72 bg-white text-slate-800 z-55 md:hidden flex flex-col shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="p-5 border-b border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight text-slate-800 leading-none">
                      DentPro<span className="text-[#0EA5E9]">Suite</span>
                    </h1>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">v1.2.0 (SaaS Multi-Clinic)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {!isPatient && (
                <div className="text-xs w-full">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Clinic Tenant</label>
                  <select
                    value={currentClinic.id}
                    onChange={(e) => {
                      switchClinic(e.target.value);
                      setMobileMenuOpen(false);
                    }}
                    id="mobile-clinic-select"
                    className="w-full p-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg focus:outline-none text-xs cursor-pointer"
                  >
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        🏢 {c.name} {c.subscriptionStatus === 'TRIAL' ? '(Trial)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => {
                      navigateTo(item.route);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-slate-50 text-[#0EA5E9] font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#0EA5E9]' : 'text-slate-400'} />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold truncate">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-xs font-medium text-slate-500 transition"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

    </div>
  );
};
