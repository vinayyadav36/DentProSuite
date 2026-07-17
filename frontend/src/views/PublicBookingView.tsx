import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, Clock, ShieldCheck, Heart, Sparkles, CheckCircle2, ChevronRight, Armchair, HelpCircle, Phone, Mail, MapPin, User
} from 'lucide-react';

export const PublicBookingView: React.FC = () => {
  const { 
    addAppointment, addPatient, patients, settings
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState('srv_2'); // Cleaning default
  const [selectedDentistId, setSelectedDentistId] = useState('user_dentist_1'); // Dr Carter
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow default
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedChair, setSelectedChair] = useState('Chair A');

  // Patient demographics state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Confirmation reference
  const [confirmedAptId, setConfirmedAptId] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Create patient demographics
    const newPat = addPatient({
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      address,
      medicalHistory: medicalNotes ? medicalNotes.split(',').map(s => s.trim()) : [],
      emergencyContact,
      notes: 'Submitted via public online self-booking gateway.'
    });

    // 2. Create actual appointment scheduled
    const newApt = addAppointment({
      patientId: newPat.id,
      dentistId: selectedDentistId,
      date: selectedDate,
      time: selectedTime,
      duration: 45, // default 45 mins
      status: 'SCHEDULED',
      serviceId: selectedServiceId,
      chairId: selectedChair,
      notes: 'Patient public self-booking.'
    });

    setConfirmedAptId(newApt.id);
    setStep(3);
  };

  const getServiceName = () => {
    if (selectedServiceId === 'srv_1') return 'Comprehensive Oral Exam';
    if (selectedServiceId === 'srv_2') return 'Dental Cleaning & Prophylaxis';
    if (selectedServiceId === 'srv_3') return 'Digital X-Rays & Screening';
    if (selectedServiceId === 'srv_4') return 'Composite Restorative Filling';
    return 'Professional Teeth Whitening';
  };

  const getDentistName = () => {
    return selectedDentistId === 'user_dentist_1' ? 'Dr. Sarah Carter' : 'Dr. Marcus Vance';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 md:p-6 select-none font-sans text-slate-800">
      
      {/* Clinic branding wrapper */}
      <div className="w-full max-w-xl text-center mb-6 space-y-2">
        <div className="w-10 h-10 rounded-lg bg-teal-500 mx-auto flex items-center justify-center font-black text-slate-950 text-sm shadow-sm">
          DPS
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{settings.name}</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Secure, HIPAA-compliant patient self-scheduling. Fill out your details below to lock in an oral treatment appointment.
        </p>
      </div>

      {/* Booking Wizard Card */}
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8">
        
        {/* Step Progress Indicators */}
        {step !== 3 && (
          <div className="flex items-center justify-center gap-2 mb-6 text-xs font-semibold text-slate-400 border-b border-slate-100 pb-4">
            <span className={step === 1 ? 'text-teal-600 font-bold' : ''}>1. Treatment & Practitioner</span>
            <ChevronRight size={14} />
            <span className={step === 2 ? 'text-teal-600 font-bold' : ''}>2. Patient Details</span>
          </div>
        )}

        {/* Step 1: Selection service/practitioner/times */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4 text-xs">
            
            {/* Service selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Dental Treatment</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
              >
                <option value="srv_1">Oral Comprehensive Screening ($85)</option>
                <option value="srv_2">Routine Prophylaxis Cleaning ($120)</option>
                <option value="srv_3">Digital X-Ray & Screening ($75)</option>
                <option value="srv_4">Composite Restorative Filling ($175)</option>
                <option value="srv_7">Professional Laser Teeth Whitening ($350)</option>
              </select>
            </div>

            {/* Practitioner selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Practitioner</label>
              <select
                value={selectedDentistId}
                onChange={(e) => setSelectedDentistId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
              >
                <option value="user_dentist_1">Dr. Sarah Carter (Hygiene Specialist)</option>
                <option value="user_dentist_2">Dr. Marcus Vance (Restorative Specialist)</option>
              </select>
            </div>

            {/* Date & Time selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Preferred Slot</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono font-bold text-slate-800"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                </select>
              </div>
            </div>

            {/* Operatory chair assignment */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Operatory Room Assignment</label>
              <select
                value={selectedChair}
                onChange={(e) => setSelectedChair(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-700"
              >
                <option value="Chair A">Chair A (Quiet Restorative operatory)</option>
                <option value="Chair B">Chair B (Panoramic window view)</option>
                <option value="Chair C">Chair C (Regular clinical hygiene chair)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mt-4 cursor-pointer"
            >
              Configure Demographics
              <ChevronRight size={14} />
            </button>
          </form>
        )}

        {/* Step 2: Patient demographics details */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender Identity</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
              <input
                type="text"
                required
                placeholder="742 Evergreen Terrace, Springfield, OR"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact (Name & Phone)</label>
              <input
                type="text"
                required
                placeholder="Jane Doe (+1 (555) 000-1111)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Allergies or Medical Warnings (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Penicillin allergy, diabetic, pregnant"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                id="public-booking-submit-btn"
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow transition cursor-pointer"
              >
                Commit Booking
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Booking Confirmation Receipt */}
        {step === 3 && (
          <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-250 text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-900 text-base">Booking Fully Confirmed</h3>
              <p className="text-slate-400 font-medium">Your appointment and demographics files have been successfully logged.</p>
              <p className="text-[10px] text-slate-400 font-mono">Reference ID: {confirmedAptId}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2 text-[11px] font-medium text-slate-600 leading-relaxed max-w-sm mx-auto">
              <p className="flex justify-between border-b border-slate-100 pb-1.5"><span className="font-bold">Patient:</span> <span className="font-semibold text-slate-800">{firstName} {lastName}</span></p>
              <p className="flex justify-between border-b border-slate-100 pb-1.5"><span className="font-bold">Treatment:</span> <span className="font-semibold text-slate-800">{getServiceName()}</span></p>
              <p className="flex justify-between border-b border-slate-100 pb-1.5"><span className="font-bold">Doctor:</span> <span className="font-semibold text-slate-800">{getDentistName()}</span></p>
              <p className="flex justify-between border-b border-slate-100 pb-1.5"><span className="font-bold">Date / Time:</span> <span className="font-bold text-teal-600 font-mono">{selectedDate} at {selectedTime}</span></p>
              <p className="flex justify-between"><span className="font-bold">Operatory Room:</span> <span className="font-bold text-slate-800 font-mono">{selectedChair}</span></p>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl max-w-sm mx-auto flex items-start gap-2.5 text-left text-teal-800 leading-relaxed text-[11px]">
              <ShieldCheck size={16} className="text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-teal-900">Pre-visit Information</span>
                Please arrive 10 minutes prior to your checkup. Bring your primary medical insurance cards for billing verification in the lobby.
              </div>
            </div>

            <button
              onClick={() => {
                // Clear state and restart wizard
                setStep(1);
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhone('');
                setDob('');
                setAddress('');
                setEmergencyContact('');
                setMedicalNotes('');
                setConfirmedAptId('');
              }}
              className="w-full max-w-sm mx-auto py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold block shadow transition"
            >
              Book Another Appointment
            </button>
          </div>
        )}

      </div>

      <div className="mt-4 text-center text-[10px] text-slate-400 font-mono">
        {settings.name} • Secure HIPAA Portal • local-first session ID {Date.now().toString().slice(-4)}
      </div>

    </div>
  );
};
