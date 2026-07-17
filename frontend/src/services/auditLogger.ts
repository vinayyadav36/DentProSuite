import { getActiveSession } from './db';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
}

const STORAGE_KEY = 'dentprosuite_audit_logs';

export function getAuditLogs(): AuditLog[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to parse audit logs', e);
    return [];
  }
}

export function addAuditLog(action: string, details: string): void {
  const session = getActiveSession();
  const logs = getAuditLogs();
  
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    userId: session?.user.id || 'system',
    userName: session?.user.name || 'System Auto-Processor',
    userRole: session?.user.role || 'SYSTEM',
    action,
    details,
  };
  
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function clearAuditLogs(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
