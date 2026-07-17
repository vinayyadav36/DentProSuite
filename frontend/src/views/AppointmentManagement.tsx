import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { ConflictPrevention } from '../components/ConflictPrevention';
import { 
  Calendar, Clock, Plus, Filter, Search, ChevronRight, X, User, Armchair, ShieldCheck, CheckCircle2, ChevronLeft, Trash2, Bell, Smartphone
} from 'lucide-react';

export const AppointmentManagement: React.FC = () => {
  const { 
    appointments, patients, addAppointment, updateAppointment, deleteAppointment, settings
  } = useApp();

  const [filterDentist, setFilterDentist] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Automated 24h Reminder Simulation Service
  const [reminderLog, setReminderLog] = useState<string[]>([]);
  const [remindedAptIds, setRemindedAptIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('reminded_appointment_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const triggerReminderSimulation = () => {
    const now = new Date();
    const logs: string[] = [];
    const newlyReminded: string[] = [...remindedAptIds];

    appointments.forEach(apt => {
      if (apt.status === 'SCHEDULED' && !newlyReminded.includes(apt.id)) {
        // Calculate difference in hours
        const aptDateTime = new Date(`${apt.date}T${apt.time}`);
        const diffMs = aptDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Standard condition: appointment is scheduled within next 36 hours (covering the 24-hour window)
        if (diffHours > 0 && diffHours <= 36) {
          const pat = patients.find(p => p.id === apt.patientId);
          const patName = pat ? `${pat.firstName} ${pat.lastName}` : `Patient ID ${apt.patientId}`;
          const patPhone = pat ? pat.phone : 'N/A';
          
          logs.push(`Dispatched automated 24-hour pre-visit verification notification to ${patName} (${patPhone}) for booking on ${apt.date} at ${apt.time}`);
          newlyReminded.push(apt.id);
        }
      }
    });

    // If no appointments were strictly within the 24-hour upcoming range, force-simulate for any SCHEDULED appointment for easy manual testing
    if (logs.length === 0) {
      const upcomingApts = appointments.filter(apt => apt.status === 'SCHEDULED' && !newlyReminded.includes(apt.id));
      if (upcomingApts.length > 0) {
        const apt = upcomingApts[0];
        const pat = patients.find(p => p.id === apt.patientId);
        const patName = pat ? `${pat.firstName} ${pat.lastName}` : `Patient ID ${apt.patientId}`;
        const patPhone = pat ? pat.phone : 'N/A';
        logs.push(`[Test Simulation] Dispatched automated 24h pre-visit notification to ${patName} (${patPhone}) for booking on ${apt.date} at ${apt.time}`);
        newlyReminded.push(apt.id);
      }
    }

    if (logs.length > 0) {
      setRemindedAptIds(newlyReminded);
      localStorage.setItem('reminded_appointment_ids', JSON.stringify(newlyReminded));
      setReminderLog(prev => [...logs, ...prev]);
      setSuccessMsg(`Reminder Service: Dispatched notifications for ${logs.length} upcoming appointments.`);
    } else {
      setSuccessMsg(`Reminder Service: All upcoming patients have already received 24-hour verification notifications.`);
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Form State
  const [formPatientId, setFormPatientId] = useState('');
  const [formDentistId, setFormDentistId] = useState('user_dentist_1');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('09:00');
  const [formDuration, setFormDuration] = useState(45);
  const [formChairId, setFormChairId] = useState('Chair A');
  const [formServiceId, setFormServiceId] = useState('srv_2'); // cleaning default
  const [formNotes, setFormNotes] = useState('');

  // Detail Drawer State
  const [selectedAptId, setSelectedAptId] = useState<string>('');
  const activeDetail = appointments.find(a => a.id === selectedAptId);
  const activeDetailPatient = activeDetail ? patients.find(p => p.id === activeDetail.patientId) : null;

  // Next/Prev Day controllers
  const adjustDay = (amount: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + amount);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // filter Appointments based on criteria
  const filteredAppointments = appointments.filter(apt => {
    if (apt.date !== selectedDate) return false;
    if (filterDentist !== 'all' && apt.dentistId !== filterDentist) return false;
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false;

    if (searchTerm) {
      const pat = patients.find(p => p.id === apt.patientId);
      const name = pat ? `${pat.firstName} ${pat.lastName}`.toLowerCase() : '';
      if (!name.includes(searchTerm.toLowerCase())) return false;
    }

    return true;
  }).sort((a,b) => a.time.localeCompare(b.time));

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formPatientId) {
      newErrors.patientId = 'Patient selection is a required field.';
    }
    if (!formDate) {
      newErrors.date = 'Appointment date is a required field.';
    } else {
      const today = new Date();
      today.setHours(0,0,0,0);
      const selectedDateObj = new Date(formDate);
      selectedDateObj.setHours(0,0,0,0);
      if (selectedDateObj < today) {
        newErrors.date = 'Appointment date cannot be scheduled in the past.';
      }
    }
    if (!formTime) {
      newErrors.time = 'Appointment time slot is required.';
    }
    if (!formChairId) {
      newErrors.chairId = 'Operatory chair must be assigned.';
    }

    // Double Booking Check (Chair-based, Date-based, and Time-based slot conflict)
    if (!newErrors.date && !newErrors.time && formChairId) {
      const conflicting = appointments.find(a => 
        a.date === formDate &&
        a.time === formTime &&
        a.chairId === formChairId &&
        a.status !== 'CANCELLED'
      );
      if (conflicting) {
        const conflictingPat = patients.find(p => p.id === conflicting.patientId);
        const patName = conflictingPat ? `${conflictingPat.firstName} ${conflictingPat.lastName}` : `ID ${conflicting.patientId}`;
        newErrors.time = `Chair Conflict! Operatory ${formChairId} is already reserved at ${formTime} for ${patName}. Please select another chair or time.`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    addAppointment({
      patientId: formPatientId,
      dentistId: formDentistId,
      date: formDate,
      time: formTime,
      duration: Number(formDuration),
      status: 'SCHEDULED',
      serviceId: formServiceId,
      chairId: formChairId,
      notes: formNotes
    });

    setSuccessMsg('Dental appointment scheduled. Ledger billing item created.');
    setIsOpen(false);
    setFormErrors({});
    
    // Reset Form
    setFormPatientId('');
    setFormNotes('');
    
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUpdateStatus = (aptId: string, status: any) => {
    updateAppointment(aptId, { status });
    setSuccessMsg(`Appointment record status updated to ${status}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          {successMsg}
        </div>
      )}

      {/* Title & Action controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-teal-600 font-bold text-xs uppercase tracking-wider font-mono">Clinic Scheduler</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Appointment Planner</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control daily clinician times and chair occupancy mappings.</p>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer shrink-0"
          id="appointments-create-trigger"
        >
          <Plus size={14} />
          Create Appointment
        </button>
      </div>

      {/* Automated 24-Hour Patient Reminder Simulation Panel */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20"><Bell size={18} /></span>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Automated Pre-Visit 24h Reminder Simulator</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Triggers simulated SMS & email verification dispatches for patient records booked in the upcoming 24-hour cycle.</p>
            </div>
          </div>
          <button
            onClick={triggerReminderSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Smartphone size={13} />
            Scan & Dispatch Reminders
          </button>
        </div>

        {reminderLog.length > 0 && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5 max-h-[110px] overflow-y-auto">
            <div className="text-teal-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>Simulation Transmission Log (Live feed)</span>
              <button onClick={() => setReminderLog([])} className="text-slate-500 hover:text-slate-300">Clear Logs</button>
            </div>
            {reminderLog.map((log, index) => (
              <div key={index} className="text-slate-300 leading-normal border-l-2 border-teal-500/40 pl-2">
                [{new Date().toLocaleTimeString()}] {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Navigator & Search Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        
        {/* Date slider picker */}
        <div className="flex items-center justify-between border border-slate-200 rounded-lg p-1.5 bg-slate-50">
          <button onClick={() => adjustDay(-1)} className="p-1.5 hover:bg-white rounded transition text-slate-500">
            <ChevronLeft size={16} />
          </button>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 font-mono text-center focus:outline-none"
          />
          <button onClick={() => adjustDay(1)} className="p-1.5 hover:bg-white rounded transition text-slate-500">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Practitioner Filter */}
        <div>
          <select
            value={filterDentist}
            onChange={(e) => setFilterDentist(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Practitioners</option>
            <option value="user_dentist_1">Dr. Sarah Carter</option>
            <option value="user_dentist_2">Dr. Marcus Vance</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="IN_CHAIR">In Chair</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Search input name */}
        <div className="relative">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={14} />
          <input
            type="text"
            placeholder="Search patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>

      </div>

      {/* Appointments Day List Board */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-24 text-slate-400 text-sm">
            <Calendar className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="font-semibold text-slate-500">No appointments scheduled for this date.</p>
            <p className="text-xs text-slate-400 mt-1">Adjust filters or click "Create Appointment" to log a visit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-6">Time / Slot</th>
                  <th className="py-3 px-6">Patient Details</th>
                  <th className="py-3 px-6">Practitioner</th>
                  <th className="py-3 px-6">Operatory Chair</th>
                  <th className="py-3 px-6">Service Category</th>
                  <th className="py-3 px-6">Current Status</th>
                  <th className="py-3 px-6 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAppointments.map((apt) => {
                  const pat = patients.find(p => p.id === apt.patientId);
                  const doc = apt.dentistId === 'user_dentist_1' ? 'Dr. Sarah Carter' : 'Dr. Marcus Vance';
                  const serviceName = apt.serviceId === 'srv_2' ? 'Prophylaxis Cleaning' : apt.serviceId === 'srv_4' ? 'Composite Filling' : apt.serviceId === 'srv_5' ? 'Root Canal Treatment' : 'Oral Examination';
                  
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/40 transition">
                      
                      {/* Time */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 font-mono block">{apt.time}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({apt.duration} mins)</span>
                      </td>

                      {/* Patient profile */}
                      <td className="py-4 px-6">
                        {pat ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">{pat.firstName} {pat.lastName}</span>
                            <span className="text-xs text-slate-400 font-mono">{pat.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unknown Patient</span>
                        )}
                      </td>

                      {/* Attending dentist */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-600">{doc}</span>
                      </td>

                      {/* Seat Chair */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          💺 {apt.chairId || 'Chair A'}
                        </span>
                      </td>

                      {/* Service rendered */}
                      <td className="py-4 px-6">
                        <span className="text-slate-600 font-medium">{serviceName}</span>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            apt.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : apt.status === 'IN_CHAIR'
                              ? 'bg-amber-50 text-amber-700'
                              : apt.status === 'CHECKED_IN'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {apt.status}
                          </span>
                          {remindedAptIds.includes(apt.id) && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded border border-teal-100 mt-1 whitespace-nowrap">
                              📱 Reminder Sent
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action trigger details */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedAptId(apt.id)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                        >
                          Actions
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      {activeDetail && activeDetailPatient && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-sm" onClick={() => setSelectedAptId('')} />
          <div className="fixed top-0 bottom-0 right-0 w-full max-w-sm bg-white shadow-2xl z-55 flex flex-col p-6 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Appointment Detail</h3>
              <button onClick={() => setSelectedAptId('')} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto">
              
              {/* Patient brief summary */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Patient Info</span>
                <p className="font-bold text-slate-800 text-sm">{activeDetailPatient.firstName} {activeDetailPatient.lastName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{activeDetailPatient.phone} • {activeDetailPatient.email}</p>
              </div>

              {/* Status and chair mapping details */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Schedule Date</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{activeDetail.date}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Start Time</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{activeDetail.time}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Selected Chair</span>
                  <span className="text-xs font-bold text-teal-600 font-mono">{activeDetail.chairId || 'Chair A'}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Category</span>
                  <span className="text-xs font-bold text-slate-800">Regular</span>
                </div>
              </div>

              {/* Patient administrative notes */}
              {activeDetail.notes && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Treatment Plan Objectives</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                    "{activeDetail.notes}"
                  </p>
                </div>
              )}

              {/* Interactive Status Adjust Actions */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Adjust Clinic Workflow Status</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(activeDetail.id, 'CHECKED_IN');
                      setSelectedAptId('');
                    }}
                    className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100 text-center"
                  >
                    Check In Lobby
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(activeDetail.id, 'IN_CHAIR');
                      setSelectedAptId('');
                    }}
                    className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-100 text-center"
                  >
                    Seat In Chair
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleUpdateStatus(activeDetail.id, 'COMPLETED');
                    setSelectedAptId('');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg text-center shadow-sm"
                >
                  Mark Completed
                </button>

                <button
                  onClick={() => {
                    handleUpdateStatus(activeDetail.id, 'CANCELLED');
                    setSelectedAptId('');
                  }}
                  className="w-full py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg text-center"
                >
                  Cancel Appointment
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Appointment Creation Modal Overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl z-55 flex flex-col p-6 animate-in slide-in-from-right duration-250">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Book Clinic Appointment</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateAppointment} className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              {/* Select active patient */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Patient Profile</label>
                <select
                  required
                  value={formPatientId}
                  onChange={(e) => {
                    setFormPatientId(e.target.value);
                    if (formErrors.patientId) setFormErrors({...formErrors, patientId: ''});
                  }}
                  className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${formErrors.patientId ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                >
                  <option value="">-- Choose Patient Demographics --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.phone})</option>
                  ))}
                </select>
                {formErrors.patientId && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.patientId}</span>}
              </div>

              {/* Select Doctor Practitioner */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Clinic Practitioner</label>
                <select
                  value={formDentistId}
                  onChange={(e) => setFormDentistId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="user_dentist_1">Dr. Sarah Carter</option>
                  <option value="user_dentist_2">Dr. Marcus Vance</option>
                </select>
              </div>

              {/* Date & Time selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      if (formErrors.date) setFormErrors({...formErrors, date: ''});
                    }}
                    className={`w-full text-xs p-2 bg-slate-50 border rounded-lg focus:outline-none font-mono ${formErrors.date ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                  />
                  {formErrors.date && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.date}</span>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Time Slot (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => {
                      setFormTime(e.target.value);
                      if (formErrors.time) setFormErrors({...formErrors, time: ''});
                    }}
                    className={`w-full text-xs p-2 bg-slate-50 border rounded-lg focus:outline-none font-mono ${formErrors.time ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                  />
                  {formErrors.time && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.time}</span>}
                </div>
              </div>

              {/* Duration and Operatory chair */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration (minutes)</label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operatory Chair</label>
                  <select
                    value={formChairId}
                    onChange={(e) => {
                      setFormChairId(e.target.value);
                      if (formErrors.chairId) setFormErrors({...formErrors, chairId: ''});
                    }}
                    className={`w-full text-xs p-2 bg-slate-50 border rounded-lg focus:outline-none ${formErrors.chairId ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                  >
                    {settings.chairs.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {formErrors.chairId && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.chairId}</span>}
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dental Treatment Category</label>
                <select
                  value={formServiceId}
                  onChange={(e) => setFormServiceId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="srv_1">Comprehensive Oral Exam</option>
                  <option value="srv_2">Dental Cleaning & Hygiene Prophylaxis</option>
                  <option value="srv_3">Digital X-Rays & Screening</option>
                  <option value="srv_4">Composite Dental Filling</option>
                  <option value="srv_5">Root Canal Treatment</option>
                  <option value="srv_6">Porcelain Dental Crown</option>
                  <option value="srv_7">Professional Teeth Whitening</option>
                </select>
              </div>

              {/* Real-time Conflict Prevention live check */}
              <div className="pt-2">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Live Schedule Verification</span>
                <ConflictPrevention
                  dentistId={formDentistId}
                  date={formDate}
                  time={formTime}
                  duration={formDuration}
                  chairId={formChairId}
                />
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Administrative Clinical Objectives</label>
                <textarea
                  placeholder="Enter custom patient notes or reasons for scheduling..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none h-16"
                />
              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  id="appointments-submit-btn"
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 shadow"
                >
                  Schedule Visit
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};
