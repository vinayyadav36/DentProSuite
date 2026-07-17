import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { 
  Calendar, Clock, CreditCard, ClipboardCheck, Heart, 
  FileText, CheckCircle2, ShieldCheck, AlertCircle, Phone, Mail, User, BookOpen
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { 
    patients, appointments, invoices, formTemplates, formSubmissions, addFormSubmission, navigateTo
  } = useApp();

  const [activeFormTemplateId, setActiveFormTemplateId] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [successMsg, setSuccessMsg] = useState('');

  // Link to John Doe (pat_1) as active patient
  const patientId = 'pat_1';
  const profile = patients.find(p => p.id === patientId);

  // Filter patient entities
  const myAppointments = appointments
    .filter(a => a.patientId === patientId)
    .sort((a,b) => b.date.localeCompare(a.date));

  const nextAppointment = myAppointments.find(a => a.status === 'SCHEDULED' || a.status === 'CHECKED_IN');
  const pastAppointments = myAppointments.filter(a => a.status === 'COMPLETED');

  const myInvoices = invoices.filter(i => i.patientId === patientId);
  const unpaidInvoices = myInvoices.filter(i => i.status === 'UNPAID' || i.status === 'PARTIALLY_PAID');

  // Find form templates that do NOT have a submission from this patient yet
  const filledTemplateIds = formSubmissions
    .filter(s => s.patientId === patientId)
    .map(s => s.templateId);

  const pendingFormTemplates = formTemplates.filter(t => !filledTemplateIds.includes(t.id));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormTemplateId) return;

    addFormSubmission({
      templateId: activeFormTemplateId,
      patientId,
      data: formData,
      status: 'COMPLETED'
    });

    setSuccessMsg('Form successfully submitted. Your clinical profile has been updated.');
    setActiveFormTemplateId('');
    setFormData({});
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      {/* Action Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          {successMsg}
        </div>
      )}

      {/* Patient Greeting block */}
      {profile && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                Patient Self-Service Portal
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ID: {profile.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Hello, {profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage your digital appointments, dental forms, and statements.</p>
          </div>
          
          <button 
            onClick={() => navigateTo('public-booking')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition shrink-0 cursor-pointer"
          >
            <Calendar size={14} />
            Book New Checkup
          </button>
        </div>
      )}

      {/* Primary Panels Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Next Appointment & Pending Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Next Appointment Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="text-teal-600" size={18} />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Next Scheduled Visit</h3>
            </div>

            {nextAppointment ? (
              <div className="p-4 bg-teal-50/25 border border-teal-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {nextAppointment.serviceId === 'srv_7' ? 'Professional Teeth Whitening' : 'Comprehensive Hygiene Check'}
                    </span>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase font-mono">
                      {nextAppointment.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">🗓️ {nextAppointment.date}</span>
                    <span className="flex items-center gap-1">⏰ {nextAppointment.time}</span>
                    <span className="flex items-center gap-1">💺 {nextAppointment.chairId || 'Chair A'}</span>
                  </div>
                  
                  <p className="text-xs text-slate-400 font-medium mt-1">Practitioner: Dr. Sarah Carter</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-teal-700 bg-teal-100/40 px-3 py-1 rounded-lg font-bold">
                    In Lobby Check-In active on arrival
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                You have no upcoming appointments booked. Use the button above to schedule.
              </div>
            )}
          </div>

          {/* Pending Forms Intake Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="text-indigo-600" size={18} />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Pending Clinic Forms</h3>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-bold">
                {pendingFormTemplates.length} Pending
              </span>
            </div>

            {pendingFormTemplates.length === 0 ? (
              <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl text-center text-xs text-emerald-800 font-medium flex items-center justify-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                All intake registrations and consents are completed.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingFormTemplates.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-300 transition">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{t.description}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveFormTemplateId(t.id);
                        setFormData({});
                      }}
                      className="w-full text-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      Fill Out Form
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past History ledger */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="text-slate-500" size={18} />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">My Visit History</h3>
            </div>

            {pastAppointments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No previous appointment histories logged.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pastAppointments.map((apt) => (
                  <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {apt.serviceId === 'srv_2' ? 'Regular Dental Cleaning & Hygiene' : 'Comprehensive Oral Diagnosis'}
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 rounded font-bold uppercase font-mono">
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-slate-400 font-mono mt-0.5">Date: {apt.date} • Attending: Dr. Sarah Carter</p>
                      {apt.notes && (
                        <p className="text-slate-500 mt-1 italic leading-relaxed font-sans bg-slate-50 p-2 rounded border border-slate-100">
                          " {apt.notes} "
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Patient Health profile & Invoices summary */}
        <div className="space-y-6">
          
          {/* Patient health summary cards */}
          {profile && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Heart className="text-rose-500" size={18} />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">My Patient Chart</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Known Allergies / Medical Warnings</span>
                  {profile.medicalHistory.length === 0 ? (
                    <span className="text-xs text-slate-500 font-semibold">No known allergies logged.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {profile.medicalHistory.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[10px] font-bold uppercase">
                          ⚠️ {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Contact Information</span>
                  <p className="font-semibold text-slate-800">Phone: {profile.phone}</p>
                  <p className="font-semibold text-slate-800">Email: {profile.email}</p>
                  <p className="font-medium text-slate-500">Address: {profile.address}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Emergency Contact</span>
                  <p className="font-bold text-slate-800">{profile.emergencyContact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Invoices summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="text-emerald-600" size={18} />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">My Invoices Ledger</h3>
            </div>

            <div className="space-y-3">
              {myInvoices.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No invoices on file.</div>
              ) : (
                myInvoices.map((inv) => {
                  const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                  const bal = inv.totalAmount - paid;
                  return (
                    <div key={inv.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:border-slate-200 transition">
                      <div>
                        <p className="font-bold text-slate-800">Invoice #{inv.id}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Issued: {inv.issuedAt} • Due: {inv.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block font-mono text-slate-800">${inv.totalAmount}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Form Completion Modal */}
      {activeFormTemplateId && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-sm" onClick={() => setActiveFormTemplateId('')} />
          <div className="fixed inset-x-4 top-10 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl z-55 flex flex-col p-6 border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Clinical Registration Intake</h3>
                <p className="text-xs text-slate-400 mt-1">Please provide accurate health history metrics.</p>
              </div>
              <button 
                onClick={() => setActiveFormTemplateId('')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {formTemplates.find(t => t.id === activeFormTemplateId)?.fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      required={field.required}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 h-20"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      required={field.required}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <label className="flex items-center gap-2 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox"
                        required={field.required}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.checked })}
                        className="rounded text-teal-600 focus:ring-teal-500/20"
                      />
                      <span className="text-xs text-slate-500 font-medium">I agree / confirm this disclosure statement.</span>
                    </label>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveFormTemplateId('')}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow transition cursor-pointer"
                  id="patient-submit-form-btn"
                >
                  Commit Intake Form
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
};
