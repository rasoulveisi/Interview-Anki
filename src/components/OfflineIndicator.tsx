import React from 'react';
import { useOnlineStatus } from '../utils/useOnlineStatus';
import { WifiOff, HardDriveDownload } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:right-auto sm:max-w-sm z-50 animate-in slide-in-from-bottom-2 fade-in">
      <div className="flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-slate-950 backdrop-blur-md px-3.5 py-2 text-xs font-bold shadow-2xl border border-amber-400">
        <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
        <div className="min-w-0">
          <p className="leading-tight truncate">Offline Mode Active</p>
          <p className="text-[10px] font-medium opacity-90 truncate">Reviews & cards saved to offline local storage.</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse ml-auto shrink-0" />
      </div>
    </div>
  );
};
