import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { 
  Users, Calendar, Clock, HeartPulse, ShieldAlert, CheckCircle2, ChevronRight, FileSpreadsheet, Armchair, Sparkles, Mic
} from 'lucide-react';

export const DentistDashboard: React.FC = () => {
  const { 
    patients, appointments, updateAppointment, session
  } = useApp();

  const [activeAptId, setActiveAptId] = useState<string>('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [treatmentSuccess, setTreatmentSuccess] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition
  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setTreatmentNotes((prev) => prev ? `${prev} ${transcript}` : transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari and ensure you have given microphone access.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Dentist's own appointments today
  // Dr. Sarah Carter is default dentist 'user_dentist_1'
  const dentistId = session?.user.id || 'user_dentist_1';
  const myAppointments = appointments
    .filter(a => a.dentistId === dentistId && a.date === todayStr)
    .sort((a,b) => a.time.localeCompare(b.time));

  // Determine current active patient (the one IN_CHAIR or the first CHECKED_IN or the first SCHEDULED)
  const currentInChair = myAppointments.find(a => a.status === 'IN_CHAIR');
  const currentActiveApt = currentInChair || myAppointments.find(a => a.status === 'CHECKED_IN') || myAppointments[0];

  // If there's an active appointment, load it as selected
  React.useEffect(() => {
    if (currentActiveApt && !activeAptId) {
      setActiveAptId(currentActiveApt.id);
      setTreatmentNotes(currentActiveApt.notes || '');
    }
  }, [currentActiveApt, activeAptId]);

  const selectedApt = appointments.find(a => a.id === activeAptId) || currentActiveApt;
  const activePatient = selectedApt ? patients.find(p => p.id === selectedApt.patientId) : null;

  const handleSaveTreatmentNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt) return;

    updateAppointment(selectedApt.id, { 
      notes: treatmentNotes,
      status: 'COMPLETED' // Auto complete appointment when dentist submits treatment notes!
    });

    setTreatmentSuccess('Clinical treatment notes locked and compiled into the patient\'s health record.');
    setTimeout(() => setTreatmentSuccess(''), 4000);
  };

  const completedToday = myAppointments.filter(a => a.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      {/* Action success alert */}
      {treatmentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          {treatmentSuccess}
        </div>
      )}

      {/* Header Practitioner banner */}
      <div className="bg-slate-950 p-6 rounded-2xl text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-mono font-bold text-xs uppercase tracking-wider">
            <HeartPulse size={12} className="animate-pulse" />
            Practitioner treatment terminal
          </div>
          <h2 className="text-xl font-bold mt-1">
            Welcome back, {session?.user.name || 'Dr. Sarah Carter'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Operatory treatment panel. Review chart records and log clinical files.</p>
        </div>

        <div className="flex gap-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[100px]">
            <span className="text-2xl font-extrabold text-white block">{myAppointments.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Today's Load</span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[100px]">
            <span className="text-2xl font-extrabold text-teal-400 block">{completedToday.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dentist Daily Treatment Schedule list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Practitioner Schedule</h3>
            <span className="text-xs text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full font-bold">Today</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {myAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No treatments scheduled today.</div>
            ) : (
              myAppointments.map((apt) => {
                const pat = patients.find(p => p.id === apt.patientId);
                const isSelected = activeAptId === apt.id;
                
                return (
                  <button
                    key={apt.id}
                    onClick={() => {
                      setActiveAptId(apt.id);
                      setTreatmentNotes(apt.notes || '');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/15 shadow-sm'
                        : 'border-slate-100 bg-slate-50/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold font-mono text-slate-900">{apt.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        apt.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'IN_CHAIR'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : apt.status === 'CHECKED_IN'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 block">
                        {pat ? `${pat.firstName} ${pat.lastName}` : 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Chair: {apt.chairId || 'Chair A'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Patient Focused clinical Workstation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          {activePatient && selectedApt ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Patient header card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {activePatient.firstName} {activePatient.lastName}
                    </h3>
                    <span className="text-xs font-semibold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                      DOB: {activePatient.dob}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Contact: {activePatient.phone} • Email: {activePatient.email}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 bg-teal-50 text-teal-800 text-xs px-3 py-1.5 rounded-xl font-bold border border-teal-100">
                  <Armchair size={14} className="text-teal-600" />
                  {selectedApt.chairId || 'Chair A'}
                </div>
              </div>

              {/* Health Allergies and Warnings disclaimer */}
              {activePatient.medicalHistory.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900 uppercase tracking-wide">
                    <ShieldAlert size={14} className="text-rose-600" />
                    CLINICAL HEALTH ALERTS & ALLERGEN DISCLAIMERS
                  </div>
                  <ul className="list-disc pl-5 font-medium">
                    {activePatient.medicalHistory.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Patient Administrative Notes */}
              {activePatient.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 uppercase text-[9px] block mb-0.5">Demographics Administrative Notes:</span>
                  {activePatient.notes}
                </div>
              )}

              {/* Procedure treatment description */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Procedure Objective</span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>
                      {selectedApt.serviceId === 'srv_2' ? 'Routine Dental Prophylaxis & Hygiene' : 'Comprehensive Diagnosis Screening'}
                    </span>
                    <span className="font-mono text-teal-600">({selectedApt.duration} mins)</span>
                  </div>
                  <p className="text-slate-500 mt-1 leading-relaxed">
                    Scheduled practitioner treatment. Confirm anesthesia levels and patient comfort levels before beginning.
                  </p>
                </div>
              </div>

              {/* Treatment clinical writing note panel */}
              <form onSubmit={handleSaveTreatmentNotes} className="space-y-3.5 border-t border-slate-100 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Practitioner Clinical Treatment Notes
                    </label>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                        isListening
                          ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                          : 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100/80'
                      }`}
                      title={isListening ? 'Stop recording voice dictation' : 'Dictate treatment notes with voice input'}
                    >
                      {isListening ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-[10px] uppercase font-extrabold tracking-wider">Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic size={12} className="text-teal-600" />
                          <span className="text-[10px] uppercase font-extrabold tracking-wider">Dictate Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    required
                    placeholder="Enter clinical observations, decay indices, tooth number references, local anesthesia dosage, and hygiene advice..."
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 h-32 leading-relaxed"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 italic">
                    *Saving treatment notes automatically locks the record as COMPLETED.
                  </span>
                  <button
                    type="submit"
                    id="dentist-submit-notes-btn"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    Lock & Complete Session
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
              <Armchair size={48} className="text-slate-300" />
              <div>
                <p className="font-bold text-slate-500">No Patient Session Active</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Select an operatory session from your daily practitioners list to review demographics and treatment objectives.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
