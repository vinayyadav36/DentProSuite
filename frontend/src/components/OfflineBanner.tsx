import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { syncState, triggerSync } = useApp();

  if (syncState.status === 'synced') return null;

  return (
    <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm transition-all duration-300 ${
      syncState.status === 'syncing'
        ? 'bg-teal-50 border-teal-200 text-teal-800'
        : syncState.status === 'error'
        ? 'bg-amber-50 border-amber-200 text-amber-800'
        : 'bg-amber-50/40 border-amber-200/50 text-slate-700'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
          syncState.status === 'syncing'
            ? 'bg-teal-100 text-teal-700'
            : syncState.status === 'error'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {syncState.status === 'syncing' ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : syncState.status === 'error' ? (
            <AlertTriangle size={18} />
          ) : (
            <WifiOff size={18} />
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {syncState.status === 'syncing' && 'Synchronizing Clinic Records to Appwrite Cloud...'}
            {syncState.status === 'error' && 'Cloud Sync Blocked'}
            {syncState.status === 'offline' && 'Operating in Local-First Sandbox'}
          </p>
          <p className="text-xs mt-0.5 text-slate-500 leading-relaxed">
            {syncState.status === 'syncing' && 'Sending local adjustments safely to the cloud repository. Please do not close the browser tab.'}
            {syncState.status === 'error' && 'Failed to establish cloud handshake. Your clinic records are fully preserved in your offline secure sandbox. You can retry anytime.'}
            {syncState.status === 'offline' && `You have ${syncState.pendingChangesCount} pending dental log adjustments saved safely locally. Clinicians can continue booking appointments offline.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {syncState.lastSyncedAt && (
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            Last synced: {syncState.lastSyncedAt}
          </span>
        )}
        <button
          onClick={triggerSync}
          disabled={syncState.status === 'syncing'}
          id="offline-banner-sync-btn"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            syncState.status === 'syncing'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow'
          }`}
        >
          {syncState.status === 'syncing' ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              Syncing
            </>
          ) : (
            <>
              <RefreshCw size={12} />
              Sync Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};
