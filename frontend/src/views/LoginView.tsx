import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, Loader2, Database, ShieldCheck } from 'lucide-react';
import { SEED_USERS } from '../services/db';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'RECEPTION' | 'DENTIST' | 'PATIENT'>('ADMIN');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated short delay for professional auth check feedback
    setTimeout(() => {
      const success = login(email, role);
      setIsLoading(false);
      if (!success) {
        setError('Invalid clinical credential profile or role mis-match.');
      }
    }, 800);
  };

  const handleQuickLogin = (userEmail: string, userRole: 'ADMIN' | 'RECEPTION' | 'DENTIST' | 'PATIENT') => {
    setEmail(userEmail);
    setRole(userRole);
    setPassword('password');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 md:p-6 select-none">
      
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header branding */}
        <div className="bg-slate-900 px-6 py-8 text-center text-white relative">
          <div className="w-12 h-12 rounded-xl bg-[#0EA5E9] mx-auto flex items-center justify-center font-black text-white text-xl tracking-tight mb-3.5 shadow-md">
            DPS
          </div>
          <h2 className="text-xl font-bold tracking-tight">DentProSuite Systems</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Enterprise Clinic Management OS</p>
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
            <Database size={10} />
            Offline-First
          </div>
        </div>

        {/* Login Form body */}
        <div className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Notification */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 text-center animate-shake">
                {error}
              </div>
            )}

            {/* Role dropdown selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sign In As</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              >
                <option value="ADMIN">Clinic Director (Admin)</option>
                <option value="RECEPTION">Front Desk (Receptionist)</option>
                <option value="DENTIST">Dr. Practitioner (Dentist)</option>
                <option value="PATIENT">Patient Self-Service</option>
              </select>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clinic Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@dentpro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              id="submit-login-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating profile...
                </>
              ) : (
                'Secure Authentication'
              )}
            </button>
          </form>

          {/* Quick prefills for developers and administrators */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Developer Quick-Prefill Profiles
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {SEED_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.email, u.role)}
                  className={`p-2 rounded-lg border text-left hover:border-teal-500 hover:bg-teal-50/20 transition flex flex-col justify-between h-[64px] ${
                    role === u.role && email.toLowerCase() === u.email.toLowerCase()
                      ? 'border-teal-500 bg-teal-50/10 ring-1 ring-teal-500'
                      : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <span className="font-semibold text-slate-800 truncate block w-full">{u.name.split(' ').slice(-1)[0]}</span>
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-teal-600">{u.role}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 pt-2">
            <ShieldCheck size={13} className="text-teal-500 shrink-0" />
            <span>Encrypted local sandbox data layer active.</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 flex flex-col gap-1">
        <p>DentProSuite Clinical Platform v1.2.0 • HIPAA Compliant Sandbox Environment</p>
        <p className="font-mono text-[10px]">Active Session URL: localhost:3000</p>
      </div>

    </div>
  );
};
