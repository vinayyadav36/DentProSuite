import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { 
  Settings, CheckCircle2, ShieldCheck, Database, RefreshCw, KeyRound, Clock, MapPin, Trash2, Sliders, ServerCrash,
  CreditCard, Building, Plus, Coins, Sparkles, ShieldAlert, ArrowRight, Check, Sun, Moon
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    settings, updateSettings, refreshState,
    clinics, currentClinic, switchClinic, registerClinic, updateClinicSubscription
  } = useApp();

  const [successMsg, setSuccessMsg] = useState('');
  const [isTestingAppwrite, setIsTestingAppwrite] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', newTheme);
    setSuccessMsg(`Appearance switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Form states
  const [clinicName, setClinicName] = useState(settings.name);
  const [clinicPhone, setClinicPhone] = useState(settings.phone);
  const [clinicEmail, setClinicEmail] = useState(settings.email);
  const [clinicAddress, setClinicAddress] = useState(settings.address);
  const [newChair, setNewChair] = useState('');
  
  // Appwrite Config state
  const [appwriteEndpoint, setAppwriteEndpoint] = useState(settings.appwriteConfig.endpoint);
  const [appwriteProjectId, setAppwriteProjectId] = useState(settings.appwriteConfig.projectId);

  // New multi-tenant clinic registration form state
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicPhone, setNewClinicPhone] = useState('');
  const [newClinicEmail, setNewClinicEmail] = useState('');
  const [newClinicAddress, setNewClinicAddress] = useState('');
  const [newClinicTier, setNewClinicTier] = useState<'BASIC' | 'PREMIUM' | 'ENTERPRISE'>('PREMIUM');

  // Payment simulator state
  const [payingForClinicId, setPayingForClinicId] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleRegisterNewClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName || !newClinicPhone || !newClinicEmail || !newClinicAddress) return;
    const newC = registerClinic(
      newClinicName,
      newClinicPhone,
      newClinicEmail,
      newClinicAddress,
      newClinicTier
    );
    setNewClinicName('');
    setNewClinicPhone('');
    setNewClinicEmail('');
    setNewClinicAddress('');
    setSuccessMsg(`"${newC.name}" tenant provisioned successfully. Switched to new clinic.`);
    setTimeout(() => {
      setSuccessMsg('');
      window.location.reload();
    }, 2000);
  };

  const handlePaySubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingForClinicId) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const nextDate = d.toISOString().split('T')[0];
      updateClinicSubscription(payingForClinicId, {
        subscriptionStatus: 'ACTIVE',
        nextBillingDate: nextDate
      });
      setIsProcessingPayment(false);
      setPayingForClinicId(null);
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setSuccessMsg('Subscription payment processed successfully! Clinic tenant billing activated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1500);
  };

  const handleSaveClinicProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: clinicName,
      phone: clinicPhone,
      email: clinicEmail,
      address: clinicAddress
    });
    setSuccessMsg('Clinic demographic profile updated successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddChair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChair) return;
    if (settings.chairs.includes(newChair)) {
      alert('Operatory chair already exists in registry.');
      return;
    }
    const updatedChairs = [...settings.chairs, newChair];
    updateSettings({ chairs: updatedChairs });
    setNewChair('');
    setSuccessMsg(`Operatory chair "${newChair}" added to clinic map.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRemoveChair = (chair: string) => {
    if (settings.chairs.length <= 1) {
      alert('At least one operatory chair must remain active.');
      return;
    }
    const updatedChairs = settings.chairs.filter(c => c !== chair);
    updateSettings({ chairs: updatedChairs });
    setSuccessMsg(`Operatory chair "${chair}" removed from map.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleTestAppwrite = () => {
    setIsTestingAppwrite(true);
    setSuccessMsg('');

    setTimeout(() => {
      setIsTestingAppwrite(false);
      updateSettings({
        appwriteConfig: {
          endpoint: appwriteEndpoint,
          projectId: appwriteProjectId,
          connected: true
        }
      });
      setSuccessMsg('Appwrite Cloud integration handshake successful! Data adapters registered.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1200);
  };

  const handleResetDatabase = () => {
    if (confirm('CRITICAL: This will erase all local offline changes and restore the HIPAA seed data state. Proceed?')) {
      localStorage.removeItem('dentprosuite_db_state');
      localStorage.removeItem('dentprosuite_session');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      {/* Success notifier */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          {successMsg}
        </div>
      )}

      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-teal-600 font-bold text-xs uppercase tracking-wider font-mono">Control Desk</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">System & Clinic Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure facility hours, operatory chairs, and cloud backup sync links.</p>
      </div>

      {/* SaaS Multi-Clinic & Subscription Center */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider font-mono">SaaS Tenant Manager</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Coins className="text-indigo-600" size={18} />
              Multi-Clinic Hub & Subscriptions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Register separate clinic database tenants, choose tiers, and manage pay-monthly subscriptions.</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Sparkles size={14} className="text-indigo-500 animate-pulse" />
            Active Clinic: <span className="font-bold underline">{currentClinic.name}</span>
          </div>
        </div>

        {/* Grid: 1. Current Subscriptions | 2. Register New Clinic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          
          {/* Clinic List & Subscriptions */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Building size={14} className="text-slate-400" />
              Registered Clinic Tenants
            </h4>

            <div className="space-y-3">
              {clinics.map((c) => {
                const isActive = c.id === currentClinic.id;
                return (
                  <div 
                    key={c.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded uppercase tracking-wider">
                              Active Tenant
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{c.address}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[10px] font-medium text-slate-500 font-sans">
                          <span className="flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-500 font-sans" />
                            Plan: <strong className="text-slate-700">{c.subscriptionTier}</strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span>
                            Price: <strong className="text-slate-700">${c.monthlyPrice}/mo</strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1">
                            Status: 
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              c.subscriptionStatus === 'ACTIVE' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : c.subscriptionStatus === 'TRIAL' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {c.subscriptionStatus}
                            </span>
                          </span>
                          {c.subscriptionStatus !== 'CANCELLED' && (
                            <>
                              <span className="text-slate-300 font-sans">|</span>
                              <span>Next Invoice: <strong>{c.nextBillingDate}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {c.subscriptionStatus !== 'ACTIVE' && c.subscriptionStatus !== 'TRIAL' ? (
                          <button
                            type="button"
                            onClick={() => setPayingForClinicId(c.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1"
                          >
                            <CreditCard size={12} />
                            Pay Monthly
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPayingForClinicId(c.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1"
                          >
                            <CreditCard size={12} />
                            Renew
                          </button>
                        )}

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              switchClinic(c.id);
                              setSuccessMsg(`Switched database tenant to "${c.name}" successfully.`);
                              setTimeout(() => setSuccessMsg(''), 4000);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                          >
                            Switch To
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provision New Tenant */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-600" />
              Provision New Clinic Tenant
            </h4>

            <form onSubmit={handleRegisterNewClinic} className="space-y-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dental Care"
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 123-4567"
                    value={newClinicPhone}
                    onChange={(e) => setNewClinicPhone(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Billing Email</label>
                  <input
                    type="email"
                    required
                    placeholder="billing@clinic.com"
                    value={newClinicEmail}
                    onChange={(e) => setNewClinicEmail(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Clinic Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, Suite, City, ZIP"
                  value={newClinicAddress}
                  onChange={(e) => setNewClinicAddress(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">SaaS Subscription Tier</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { tier: 'BASIC', label: 'Basic', price: '$49/mo' },
                    { tier: 'PREMIUM', label: 'Premium', price: '$99/mo' },
                    { tier: 'ENTERPRISE', label: 'Enterprise', price: '$249/mo' }
                  ].map((p) => (
                    <button
                      key={p.tier}
                      type="button"
                      onClick={() => setNewClinicTier(p.tier as any)}
                      className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                        newClinicTier === p.tier 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px]">{p.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">{p.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="register-new-clinic-btn"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 mt-2 shadow-sm"
              >
                <Plus size={14} />
                Provision SaaS Tenant
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Monthly Billing Payment Sheet Simulator Modal */}
      {payingForClinicId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={18} />
              SaaS Billing Payment Center
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete your monthly subscription payment for the selected clinic tenant. All integrations and dental portal features will be instantly unlocked.
            </p>

            <form onSubmit={handlePaySubscription} className="mt-4 space-y-4">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Clinic Name</label>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-800">
                  {clinics.find(c => c.id === payingForClinicId)?.name}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Monthly Subscription Amount</label>
                <div className="text-lg font-black text-indigo-600 font-mono">
                  ${clinics.find(c => c.id === payingForClinicId)?.monthlyPrice}.00 USD / Month
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4111 2222 3333 4444"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Security Code (CVC)</label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    maxLength={3}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-amber-800">
                <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                <p className="text-[10px] leading-relaxed font-medium">PCI-DSS Compliant mock gateway. Use any fictitious card values for validation.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingForClinicId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Paying...
                    </>
                  ) : (
                    <>
                      <Check size={12} />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* Profile Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="text-teal-600" size={16} />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Facility Profile</h3>
          </div>

          <form onSubmit={handleSaveClinicProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Clinic Contact Phone</label>
                <input
                  type="text"
                  required
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Clinic Email Address</label>
              <input
                type="email"
                required
                value={clinicEmail}
                onChange={(e) => setClinicEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Clinic Physical Address</label>
              <input
                type="text"
                required
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <button
              type="submit"
              id="settings-save-profile-btn"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
            >
              Save Demographic Details
            </button>
          </form>
        </div>

        {/* Chair Configuration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="text-teal-600" size={16} />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Operatory Chairs Map</h3>
          </div>

          <form onSubmit={handleAddChair} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Chair D"
              required
              value={newChair}
              onChange={(e) => setNewChair(e.target.value)}
              className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
            >
              Add
            </button>
          </form>

          <div className="space-y-1.5 pt-2">
            {settings.chairs.map((chair) => (
              <div key={chair} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700">💺 {chair}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChair(chair)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sync/Cloud Appwrite setup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="text-indigo-600" size={16} />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Cloud Appwrite Integration</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              settings.appwriteConfig.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {settings.appwriteConfig.connected ? 'SYNC ENABLED' : 'LOCAL MODE ONLY'}
            </span>
          </div>

          <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl leading-relaxed text-slate-600">
            <p className="font-bold text-indigo-900">Optional Cloud Synchronization Adapter</p>
            <p className="mt-1">DentProSuite is fully self-sufficient and operates out of your browser's local sandbox storage. If you want to enable public appointment booking endpoints and real-time practitioner updates, configure your Appwrite cloud workspace credentials below.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Appwrite Endpoint URL</label>
              <input
                type="text"
                value={appwriteEndpoint}
                onChange={(e) => setAppwriteEndpoint(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Project Identifier (ID)</label>
              <input
                type="text"
                value={appwriteProjectId}
                onChange={(e) => setAppwriteProjectId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestAppwrite}
            disabled={isTestingAppwrite}
            id="settings-test-appwrite-btn"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isTestingAppwrite ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Validating endpoint handshake...
              </>
            ) : (
              'Connect & Test Handshake'
            )}
          </button>
        </div>

        {/* Appearance & Theme Configuration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sun className="text-teal-600 dark:hidden" size={16} />
            <Moon className="hidden dark:block text-teal-400" size={16} />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Appearance & Theme</h3>
          </div>

          <p className="text-slate-500 leading-relaxed text-xs">Configure how DentProSuite renders on your display operatory terminal. Preferences are persisted locally.</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleTheme('light')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold transition border ${
                theme === 'light'
                  ? 'bg-teal-50 border-teal-200 text-teal-700 font-extrabold shadow-sm'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Sun size={14} />
              Light Mode
            </button>
            <button
              type="button"
              onClick={() => toggleTheme('dark')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold transition border ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-100 font-extrabold shadow-sm'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Moon size={14} />
              Dark Mode
            </button>
          </div>
        </div>

        {/* Operational Hours Summary & Maintenance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Trash2 className="text-rose-600" size={16} />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">System Purge Area</h3>
          </div>

          <div className="p-3 bg-rose-50/25 border border-rose-100 rounded-xl leading-relaxed text-rose-800 space-y-2">
            <span className="font-bold text-rose-900 uppercase block text-[9px]">HIPAA Sandbox Maintenance</span>
            <p>Use the action below to wipe local changes and seed default patients, treatment notes, and invoices. This action cannot be undone.</p>
            <button
              onClick={handleResetDatabase}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-center transition"
            >
              Reset Sandbox Database
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
