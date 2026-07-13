import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ConflictPreventionProps {
  dentistId: string;
  date: string;
  time: string;
  duration: number; // minutes
  chairId: string;
  excludeAppointmentId?: string;
}

export const ConflictPrevention: React.FC<ConflictPreventionProps> = ({
  dentistId,
  date,
  time,
  duration,
  chairId,
  excludeAppointmentId
}) => {
  const { appointments, patients } = useApp();

  if (!dentistId || !date || !time) {
    return (
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 font-medium">
        Select a dentist, date, and time to run a scheduling safety check.
      </div>
    );
  }

  // Parse candidate times
  const [candidateHour, candidateMin] = time.split(':').map(Number);
  const candidateStartMin = candidateHour * 60 + candidateMin;
  const candidateEndMin = candidateStartMin + Number(duration);

  // Find conflicts
  const conflicts = appointments.filter(apt => {
    // Skip self if editing
    if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
    
    // Must match date and active status
    if (apt.date !== date || apt.status === 'CANCELLED') return false;

    // Parse existing appointment times
    const [aptHour, aptMin] = apt.time.split(':').map(Number);
    const aptStartMin = aptHour * 60 + aptMin;
    const aptEndMin = aptStartMin + apt.duration;

    // Check overlap: startA < endB and endA > startB
    const overlap = candidateStartMin < aptEndMin && candidateEndMin > aptStartMin;
    if (!overlap) return false;

    // Conflicting criteria: either same Dentist OR same Chair allocation
    return apt.dentistId === dentistId || (chairId && apt.chairId === chairId);
  });

  if (conflicts.length === 0) {
    return (
      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 flex items-center gap-2.5">
        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
        <div>
          <span className="font-semibold block">Schedule Safety Verified</span>
          <span className="text-emerald-600/90">No overlapping clinician bookings or operatory chair clashes found for this slot.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1.5">
      <div className="flex items-start gap-2">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-900">Scheduling Hazard Detected</span>
          <p className="text-amber-800/90 mt-0.5">
            The selected window overlaps with {conflicts.length} existing clinic activities:
          </p>
        </div>
      </div>
      
      <div className="pl-6 space-y-1 divide-y divide-amber-100/40 pt-1">
        {conflicts.map((c, i) => {
          const pat = patients.find(p => p.id === c.patientId);
          const isDentistConflict = c.dentistId === dentistId;
          const isChairConflict = c.chairId === chairId && chairId;
          
          return (
            <div key={c.id} className="pt-1 first:pt-0">
              <span className="font-semibold">
                {c.time} ({c.duration} mins)
              </span>{' '}
              - Patient:{' '}
              <span className="font-medium underline">
                {pat ? `${pat.firstName} ${pat.lastName}` : 'Unknown Patient'}
              </span>
              <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                {isDentistConflict && '⚠️ Practitioner Double-booking'}
                {isDentistConflict && isChairConflict && ' | '}
                {isChairConflict && `⚠️ Chair conflict (${chairId})`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
