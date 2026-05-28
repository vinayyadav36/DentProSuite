// Define constants that can be used as simple schema validation defaults or rules
export const APPOINTMENT_STATUSES = ['SCHEDULED', 'CHECKED_IN', 'IN_CHAIR', 'COMPLETED', 'NO_SHOW'] as const;
export const USER_ROLES = ['ADMIN', 'RECEPTION', 'DENTIST', 'PATIENT'] as const;
export const FORM_FIELD_TYPES = ['text', 'checkbox', 'date', 'signature', 'select'] as const;

export const DEFAULT_CLINIC_HOURS = {
  start: '08:00',
  end: '18:00'
};
