import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { 
  Users, Calendar, Clock, Sparkles, Search, ChevronRight, AlertTriangle, CheckCircle2, UserCheck, Armchair, Plus, CreditCard
} from 'lucide-react';

export const ReceptionDashboard: React.FC = () => {
  const { 
    patients, appointments, invoices, updateAppointment, navigateTo, addPatient, addAppointment
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChair, setSelectedChair] = useState('Chair A');
  const [successMsg, setSuccessMsg] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filters for today's schedule
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const scheduledQueue = todayAppointments.filter(a => a.status === 'SCHEDULED').sort((a,b) => a.time.localeCompare(b.time));
  const activeLobby = todayAppointments.filter(a => a.status === 'CHECKED_IN').sort((a,b) => a.time.localeCompare(b.time));
  const inChairs = todayAppointments.filter(a => a.status === 'IN_CHAIR').sort((a,b) => a.time.localeCompare(b.time));
  const completedToday = todayAppointments.filter(a => a.status === 'COMPLETED').sort((a,b) => a.time.localeCompare(b.time));

  // Outstanding unpaid invoices
  const outstandingInvoices = invoices
    .filter(i => i.status === 'UNPAID' || i.status === 'PARTIALLY_PAID')
    .slice(0, 4);

  // Search patients
  const filteredPatients = searchTerm
    ? patients.filter(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleCheckIn = (aptId: string) => {
    updateAppointment(aptId, { status: 'CHECKED_IN' });
    setSuccessMsg('Patient checked-in successfully. Notification dispatched to primary practitioner.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSeatPatient = (aptId: string, chair: string) => {
    updateAppointment(aptId, { status: 'IN_CHAIR', chairId: chair });
    setSuccessMsg(`Patient seated successfully in ${chair}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCompleteApt = (aptId: string) => {
    updateAppointment(aptId, { status: 'COMPLETED' });
    setSuccessMsg('Treatment marked completed. Invoice generated in Ledger.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Get occupied chairs
  const getChairOccupancy = (chair: string) => {
    const occupant = inChairs.find(a => a.chairId === chair);
    if (occupant) {
      const pat = patients.find(p => p.id === occupant.patientId);
      return {
        status: 'occupied',
        patientName: pat ? `${pat.firstName} ${pat.lastName}` : 'Unknown',
        time: occupant.time,
        aptId: occupant.id
      };
    }
    
    const reserved = scheduledQueue.find(a => a.chairId === chair);
    if (reserved) {
      return {
        status: 'reserved',
        patientName: 'Reserved',
        time: reserved.time
      };
    }

    return { status: 'available' };
  };

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      {/* Action Notification banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          {successMsg}
        </div>
      )}

      {/* Title block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-teal-600 font-bold text-xs uppercase tracking-wider font-mono">Reception Operations Console</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Lobby & Front Desk Desk</h2>
          <p className="text-sm text-slate-500 mt-0.5">Seat patients, process check-ins, and manage operatory chair schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateTo('appointments')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <Plus size={14} />
            Quick Appointment Book
          </button>
        </div>
      </div>

      {/* Patient Search Module */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Lobby Patient Demographics Lookup</h3>
        <div className="relative">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-3" size={18} />
          <input
            type="text"
            placeholder="Type name, phone, or email to lookup active records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {searchTerm && (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
            {filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">No patient records match the search parameters.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {filteredPatients.map((pat) => (
                  <div key={pat.id} className="p-3 flex items-center justify-between text-sm hover:bg-white transition">
                    <div>
                      <p className="font-semibold text-slate-800">{pat.firstName} {pat.lastName}</p>
                      <p className="text-xs text-slate-400 font-mono">{pat.email} • {pat.phone}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('patients', { id: pat.id })}
                      className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Lobby Queue Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scheduled Appointments / Ready to Check In */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Scheduled Today ({scheduledQueue.length})</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {scheduledQueue.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No pending scheduled arrivals.</div>
            ) : (
              scheduledQueue.map((apt) => {
                const pat = patients.find(p => p.id === apt.patientId);
                return (
                  <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 hover:border-slate-300 transition">
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-900 block">{apt.time}</span>
                      <span className="font-semibold text-xs text-slate-700 truncate block">
                        {pat ? `${pat.firstName} ${pat.lastName}` : 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Chair: {apt.chairId || 'TBD'}</span>
                    </div>
                    <button
                      onClick={() => handleCheckIn(apt.id)}
                      className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <UserCheck size={12} />
                      Check In
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lobby Waiting Area / Ready to Seat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Waiting in Lobby ({activeLobby.length})</span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {activeLobby.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">Lobby is currently vacant.</div>
            ) : (
              activeLobby.map((apt) => {
                const pat = patients.find(p => p.id === apt.patientId);
                return (
                  <div key={apt.id} className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl flex flex-col gap-2 hover:border-indigo-200 transition">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-xs font-mono font-bold text-indigo-700 block">{apt.time} (Arrived)</span>
                        <span className="font-semibold text-xs text-slate-800 truncate block">
                          {pat ? `${pat.firstName} ${pat.lastName}` : 'Patient'}
                        </span>
                      </div>
                      <span className="p-1 bg-indigo-100 rounded-lg text-indigo-700"><Clock size={14} /></span>
                    </div>
                    
                    {/* Chair allocation selector inside Lobby list */}
                    <div className="flex items-center gap-1.5 border-t border-indigo-100/40 pt-2">
                      <select
                        onChange={(e) => setSelectedChair(e.target.value)}
                        className="text-[11px] bg-white border border-indigo-200 rounded p-1 font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="Chair A">Chair A</option>
                        <option value="Chair B">Chair B</option>
                        <option value="Chair C">Chair C</option>
                      </select>
                      <button
                        onClick={() => handleSeatPatient(apt.id, selectedChair)}
                        className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold text-center"
                      >
                        Seat Patient
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Currently in Chair / Active Treatment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">In-Chair Treatment ({inChairs.length})</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {inChairs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No active treatments in progress.</div>
            ) : (
              inChairs.map((apt) => {
                const pat = patients.find(p => p.id === apt.patientId);
                return (
                  <div key={apt.id} className="p-3 bg-amber-50/30 border border-amber-200 rounded-xl flex items-center justify-between gap-2 hover:border-amber-300 transition">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-amber-800 block">💺 {apt.chairId || 'Chair A'}</span>
                      <span className="font-bold text-xs text-slate-800 truncate block">
                        {pat ? `${pat.firstName} ${pat.lastName}` : 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono">Started: {apt.time}</span>
                    </div>
                    <button
                      onClick={() => handleCompleteApt(apt.id)}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 shadow-sm"
                    >
                      Complete
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Chair Allocation & Outstanding Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Operatory Chairs status visual mapping */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Armchair className="text-teal-600" size={16} />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Operatory Chair Allocation Map</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Chair A', 'Chair B', 'Chair C'].map((chair) => {
              const state = getChairOccupancy(chair);
              return (
                <div 
                  key={chair} 
                  className={`p-4 rounded-xl border flex flex-col items-center text-center justify-between gap-2 transition ${
                    state.status === 'occupied'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : state.status === 'reserved'
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-emerald-50/55 border-emerald-100 text-emerald-900'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">{chair}</span>
                  <div className={`p-2.5 rounded-full ${
                    state.status === 'occupied'
                      ? 'bg-amber-100 text-amber-700'
                      : state.status === 'reserved'
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <Armchair size={18} />
                  </div>
                  
                  <div className="min-h-[40px] flex flex-col justify-center">
                    {state.status === 'occupied' && (
                      <>
                        <span className="text-[10px] font-bold truncate max-w-[90px] block">{state.patientName}</span>
                        <span className="text-[9px] text-amber-600 font-mono block mt-0.5">{state.time}</span>
                      </>
                    )}
                    {state.status === 'reserved' && (
                      <>
                        <span className="text-[10px] font-semibold text-slate-400">Reserved</span>
                        <span className="text-[9px] text-slate-400 font-mono">{state.time}</span>
                      </>
                    )}
                    {state.status === 'available' && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Empty</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outstanding Payment Reminder List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="text-rose-500" size={16} />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Outstanding Ledger Balances</h3>
          </div>

          <div className="space-y-3">
            {outstandingInvoices.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No outstanding patient bills.</div>
            ) : (
              outstandingInvoices.map((inv) => {
                const pat = patients.find(p => p.id === inv.patientId);
                const paidAmt = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                const balanceDue = inv.totalAmount - paidAmt;
                
                return (
                  <div key={inv.id} className="p-3 bg-rose-50/20 border border-rose-100 rounded-xl flex items-center justify-between gap-2 hover:border-rose-200 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {pat ? `${pat.firstName} ${pat.lastName}` : 'Unknown Patient'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Invoice #{inv.id} • Issued: {inv.issuedAt}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-rose-700 block font-mono">${balanceDue}</span>
                      <button
                        onClick={() => navigateTo('billing')}
                        className="text-[10px] text-teal-600 hover:text-teal-700 font-bold underline block"
                      >
                        Ledger
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
