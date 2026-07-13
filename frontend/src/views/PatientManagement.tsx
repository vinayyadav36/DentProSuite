import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { 
  Users, Calendar, CreditCard, FileText, Search, UserPlus, 
  ChevronRight, Heart, HeartPulse, ShieldAlert, CheckCircle2, Phone, Mail, MapPin, User, FileClock, Plus, Trash2,
  Camera, Video
} from 'lucide-react';

export const PatientManagement: React.FC = () => {
  const { 
    patients, appointments, invoices, formSubmissions, formTemplates, addPatient, updatePatient, deletePatient, routeParams, navigateTo
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab control inside detailed profile
  const [profileTab, setProfileTab] = useState<'demographics' | 'history' | 'visits' | 'forms' | 'billing'>('demographics');

  // Camera integration state for Patient Profile photo capture
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setIsCapturing(true);
    try {
      const constraints = {
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false
      };
      const streamObj = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(streamObj);
      if (videoRef.current) {
        videoRef.current.srcObject = streamObj;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access denied or failed:', err);
      setCameraError('Permission denied or camera device unavailable. Please allow camera permissions in your browser and try again.');
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCapturing(false);
    setCameraError(null);
  };

  const capturePhoto = (patientId: string) => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 320);
        const base64Photo = canvas.toDataURL('image/jpeg', 0.85);
        updatePatient(patientId, { photoUrl: base64Photo });
      }
      stopCamera();
    }
  };

  // Handle selected patient ID
  const defaultPatId = routeParams.id || (patients[0]?.id || '');
  const [selectedPatId, setSelectedPatId] = useState<string>(defaultPatId);

  // Patient registration modal form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Female',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    notes: '',
    medicalAlerts: ''
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is a mandatory field.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is a mandatory field.';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required.';
    } else {
      const dobDate = new Date(formData.dob);
      if (dobDate > new Date()) {
        newErrors.dob = 'Date of birth cannot be in the future.';
      }
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telephone number is required.';
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone format (e.g., +1 555-0199).';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact details are required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    // Success: add patient
    const createdPatient = addPatient({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dob: formData.dob,
      gender: formData.gender,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      notes: formData.notes.trim(),
      medicalHistory: formData.medicalAlerts ? formData.medicalAlerts.split(',').map(s => s.trim()).filter(Boolean) : []
    });

    // Reset form and close modal
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: 'Female',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      notes: '',
      medicalAlerts: ''
    });
    setFormErrors({});
    setIsAddOpen(false);
    setSelectedPatId(createdPatient.id);
  };

  // Sync selected Patient ID if changed from route
  React.useEffect(() => {
    if (routeParams.id && routeParams.id !== selectedPatId) {
      setSelectedPatId(routeParams.id);
    }
  }, [routeParams.id, selectedPatId]);

  // Calculations for list
  const filteredPatients = patients.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || p.phone.includes(search) || p.email.toLowerCase().includes(search);
  });

  const activePat = patients.find(p => p.id === selectedPatId) || patients[0];

  // Specific patient entities
  const patAppointments = activePat ? appointments.filter(a => a.patientId === activePat.id).sort((a,b) => b.date.localeCompare(a.date)) : [];
  const patInvoices = activePat ? invoices.filter(i => i.patientId === activePat.id) : [];
  const patSubmissions = activePat ? formSubmissions.filter(s => s.patientId === activePat.id) : [];

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Patients search list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Patients ({patients.length})</h3>
            <button
              onClick={() => {
                setFormErrors({});
                setIsAddOpen(true);
              }}
              className="flex items-center gap-1 text-[10px] uppercase font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-2 py-1.5 rounded-lg transition"
            >
              <UserPlus size={11} /> Register
            </button>
          </div>

          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={14} />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No clinic files match parameters.</div>
            ) : (
              filteredPatients.map((pat) => {
                const isSelected = activePat?.id === pat.id;
                return (
                  <button
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatId(pat.id);
                      setProfileTab('demographics');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/15 ring-1 ring-teal-500 shadow-sm'
                        : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {pat.photoUrl ? (
                        <img 
                          src={pat.photoUrl} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-250 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                          {pat.firstName[0]}{pat.lastName[0]}
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <p className="font-semibold text-xs text-slate-800 truncate">{pat.firstName} {pat.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{pat.phone}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className={isSelected ? 'text-teal-600' : 'text-slate-400'} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Detailed Patient Chart multi-tab */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 lg:col-span-2">
          {activePat ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Profile master Header summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    {activePat.photoUrl ? (
                      <img 
                        src={activePat.photoUrl} 
                        alt="Profile Photo" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shrink-0 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border-2 border-teal-200 uppercase shrink-0">
                        {activePat.firstName[0]}{activePat.lastName[0]}
                      </div>
                    )}
                    <button
                      onClick={startCamera}
                      className="absolute -bottom-1 -right-1 p-1 bg-slate-900 text-white hover:bg-teal-600 rounded-full border border-white transition shadow cursor-pointer"
                      title="Capture Profile Photo"
                    >
                      <Camera size={10} />
                    </button>
                  </div>
                  
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg">{activePat.firstName} {activePat.lastName}</h2>
                    <p className="text-xs text-slate-400 font-medium">Record Created: {activePat.createdAt} • ID: {activePat.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigateTo('appointments')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition"
                  >
                    <Plus size={13} />
                    Book Appointment
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`CRITICAL HIPAA WARNING: Are you sure you want to permanently DELETE and PURGE ${activePat.firstName} ${activePat.lastName}'s clinical file? This will wipe all demographics, intake forms, clinical visits, and outstanding invoice balances. This action is audited.`)) {
                        deletePatient(activePat.id);
                        setSelectedPatId('');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                    title="Permanently Delete Patient Chart"
                  >
                    <Trash2 size={13} />
                    Delete Chart
                  </button>
                </div>
              </div>

              {/* Camera Capture Live Viewfinder Stream */}
              {isCapturing && (
                <div className="p-4 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 space-y-3 animate-in slide-in-from-top-4 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span> Live Camera Viewfinder
                    </span>
                    <button
                      onClick={stopCamera}
                      className="text-[10px] uppercase font-bold text-slate-400 hover:text-white"
                    >
                      Close Stream
                    </button>
                  </div>

                  {cameraError ? (
                    <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs font-semibold leading-relaxed">
                      {cameraError}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                      <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden border-2 border-teal-500 bg-slate-900 shadow-inner shrink-0">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Patient Photograph Desk</p>
                        <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed">Align the patient's face inside the camera ring. Captured images are scaled locally and mapped as base64 to the clinic registry.</p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                          <button
                            onClick={() => capturePhoto(activePat.id)}
                            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-lg transition shadow-md cursor-pointer"
                          >
                            Snap Photograph
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Patient Tab switcher */}
              <div className="flex border-b border-slate-100 gap-1 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setProfileTab('demographics')}
                  className={`pb-2 px-3 border-b-2 transition ${profileTab === 'demographics' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Demographics
                </button>
                <button
                  onClick={() => setProfileTab('history')}
                  className={`pb-2 px-3 border-b-2 transition ${profileTab === 'history' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Medical Alerts
                </button>
                <button
                  onClick={() => setProfileTab('visits')}
                  className={`pb-2 px-3 border-b-2 transition ${profileTab === 'visits' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Visits ({patAppointments.length})
                </button>
                <button
                  onClick={() => setProfileTab('forms')}
                  className={`pb-2 px-3 border-b-2 transition ${profileTab === 'forms' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Intake Forms ({patSubmissions.length})
                </button>
                <button
                  onClick={() => setProfileTab('billing')}
                  className={`pb-2 px-3 border-b-2 transition ${profileTab === 'billing' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Ledger Billing ({patInvoices.length})
                </button>
              </div>

              {/* Tab 1: Demographics */}
              {profileTab === 'demographics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider">Primary Information</h4>
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600">
                      <p className="flex justify-between"><span className="font-bold">First Name:</span> <span className="text-slate-800">{activePat.firstName}</span></p>
                      <p className="flex justify-between"><span className="font-bold">Last Name:</span> <span className="text-slate-800">{activePat.lastName}</span></p>
                      <p className="flex justify-between"><span className="font-bold">Date of Birth:</span> <span className="text-slate-800 font-mono">{activePat.dob}</span></p>
                      <p className="flex justify-between"><span className="font-bold">Gender Identity:</span> <span className="text-slate-800">{activePat.gender}</span></p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider">Contact & Emergency Details</h4>
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600">
                      <p className="flex justify-between"><span className="font-bold">Telephone:</span> <span className="text-slate-800 font-mono">{activePat.phone}</span></p>
                      <p className="flex justify-between"><span className="font-bold">Email:</span> <span className="text-slate-800">{activePat.email}</span></p>
                      <p className="flex flex-col gap-1"><span className="font-bold">Residential Address:</span> <span className="text-slate-800">{activePat.address}</span></p>
                      <p className="flex flex-col gap-1 border-t border-slate-200/50 pt-2"><span className="font-bold">Emergency Contact:</span> <span className="text-rose-700 font-bold">{activePat.emergencyContact}</span></p>
                    </div>
                  </div>

                  {activePat.notes && (
                    <div className="md:col-span-2 space-y-2">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider">Administrative Notes</h4>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 leading-relaxed italic">
                        "{activePat.notes}"
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Medical Alerts */}
              {profileTab === 'history' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-rose-900 uppercase tracking-wider">
                      <ShieldAlert size={16} />
                      Active Clinic Allergen Disclaimers
                    </div>
                    
                    {activePat.medicalHistory.length === 0 ? (
                      <p className="font-semibold text-rose-700">No active disclaimers or allergies logged on this record file.</p>
                    ) : (
                      <ul className="list-disc pl-5 font-bold space-y-1">
                        {activePat.medicalHistory.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 leading-relaxed space-y-1.5">
                    <span className="font-bold text-slate-800 text-[10px] uppercase">Practitioner Guidelines</span>
                    <p>Always re-verify patients' allergen warnings verbally before preparing local anesthesia, restorative composites, or prescribing antibiotics. Ensure any updates are immediately updated in these files.</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Visits */}
              {profileTab === 'visits' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Previous Clinic Visits</h4>
                  
                  {patAppointments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No appointments logged.</div>
                  ) : (
                    <div className="space-y-3">
                      {patAppointments.map((apt) => {
                        const serviceName = apt.serviceId === 'srv_2' ? 'Regular Dental Cleaning' : apt.serviceId === 'srv_4' ? 'Composite Restorative Filling' : apt.serviceId === 'srv_5' ? 'Root Canal Treatment' : 'Comprehensive Examination';
                        const doc = apt.dentistId === 'user_dentist_1' ? 'Dr. Sarah Carter' : 'Dr. Marcus Vance';
                        return (
                          <div key={apt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:border-slate-200 transition">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{serviceName}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                apt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>{apt.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-400 font-mono font-medium">
                              <span>Date: {apt.date}</span>
                              <span>Time: {apt.time}</span>
                              <span>Doctor: {doc}</span>
                              <span>Chair: {apt.chairId || 'Chair A'}</span>
                            </div>
                            {apt.notes && (
                              <p className="text-[11px] text-slate-500 font-sans italic bg-white p-2.5 rounded border border-slate-100/50 leading-relaxed">
                                " {apt.notes} "
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Intake Forms */}
              {profileTab === 'forms' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Submitted Intake Forms</h4>
                  
                  {patSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No completed digital forms on file.</div>
                  ) : (
                    <div className="space-y-4">
                      {patSubmissions.map((sub) => {
                        const template = formTemplates.find(t => t.id === sub.templateId);
                        return (
                          <div key={sub.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                              <div>
                                <span className="font-bold text-slate-800 block">{template?.title || 'Unknown Template'}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold font-mono">LOCKED</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 leading-relaxed">
                              {Object.entries(sub.data).map(([key, val]) => {
                                const field = template?.fields.find(f => f.id === key);
                                return (
                                  <div key={key} className="bg-white p-2 rounded border border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-semibold block">{field?.label || key}</span>
                                    <span className="font-semibold text-slate-800 text-[11px] mt-0.5 block">
                                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Ledger Billing */}
              {profileTab === 'billing' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Billing Ledger & Statements</h4>
                  
                  {patInvoices.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No invoices generated for this patient.</div>
                  ) : (
                    <div className="space-y-3">
                      {patInvoices.map((inv) => {
                        const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                        const balance = inv.totalAmount - paid;
                        return (
                          <div key={inv.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">Invoice #{inv.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>{inv.status}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">Issued: {inv.issuedAt} • Due Date: {inv.dueDate}</p>
                              
                              <div className="mt-2 space-y-1">
                                {inv.items.map((it, idx) => (
                                  <span key={idx} className="block text-[10px] text-slate-500">• {it.description} (${it.unitPrice})</span>
                                ))}
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-slate-200/50 pt-2 sm:pt-0">
                              <span className="text-xs font-semibold text-slate-400 block">Total Statement</span>
                              <span className="text-base font-extrabold text-slate-900 font-mono block">${inv.totalAmount}</span>
                              {balance > 0 && (
                                <span className="text-[10px] text-rose-600 font-bold block mt-0.5">Patient Copay: ${balance}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-24 text-slate-400">
              Select a clinic patient to view their medical chart histories.
            </div>
          )}
        </div>

      </div>

      {/* Patient Registration Overlay Modal */}
      {isAddOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 transition-all" onClick={() => setIsAddOpen(false)} />
          <div className="fixed inset-x-4 top-[8%] md:max-w-2xl md:mx-auto bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Register Patient Clinical Chart</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Enter validated patient credentials and demographic records</p>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({...formData, firstName: e.target.value});
                      if (formErrors.firstName) setFormErrors({...formErrors, firstName: ''});
                    }}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${formErrors.firstName ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                    placeholder="e.g. Eleanor"
                  />
                  {formErrors.firstName && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.firstName}</span>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({...formData, lastName: e.target.value});
                      if (formErrors.lastName) setFormErrors({...formErrors, lastName: ''});
                    }}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${formErrors.lastName ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                    placeholder="e.g. Vance"
                  />
                  {formErrors.lastName && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.lastName}</span>}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => {
                      setFormData({...formData, dob: e.target.value});
                      if (formErrors.dob) setFormErrors({...formErrors, dob: ''});
                    }}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${formErrors.dob ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                  />
                  {formErrors.dob && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.dob}</span>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gender Identity</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Telephone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value});
                      if (formErrors.phone) setFormErrors({...formErrors, phone: ''});
                    }}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${formErrors.phone ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                  {formErrors.phone && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.phone}</span>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if (formErrors.email) setFormErrors({...formErrors, email: ''});
                    }}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${formErrors.email ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                    placeholder="e.g. eleanor@example.com"
                  />
                  {formErrors.email && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.email}</span>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    placeholder="Street, City, State, ZIP"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-rose-600 mb-1">Emergency Contact (Name & Telephone) *</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => {
                      setFormData({...formData, emergencyContact: e.target.value});
                      if (formErrors.emergencyContact) setFormErrors({...formErrors, emergencyContact: ''});
                    }}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${formErrors.emergencyContact ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200'}`}
                    placeholder="e.g. Thomas Vance (+1 555-9011)"
                  />
                  {formErrors.emergencyContact && <span className="text-[10px] text-rose-600 font-bold block mt-1">{formErrors.emergencyContact}</span>}
                </div>

                {/* Medical Alerts */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Medical Alerts & Allergies (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.medicalAlerts}
                    onChange={(e) => setFormData({...formData, medicalAlerts: e.target.value})}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    placeholder="e.g. Penicillin Allergy, Hemophilia, High Blood Pressure"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Clinical Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none h-16 resize-none"
                    placeholder="Any general behavioral or dental notes..."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/35 -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow transition"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
};
