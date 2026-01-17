
import React, { useState, useEffect } from 'react';

interface TopBarProps {
  martName: string;
  onLock: () => void;
  isExternal?: boolean;
  isSyncing?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ martName, onLock, isExternal, isSyncing }) => {
  const [time, setTime] = useState(new Date());
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simple visual ping to show if backend is actually reachable
  useEffect(() => {
    if (!isExternal) {
      setIsBackendHealthy(null);
      return;
    }

    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/health', { signal: AbortSignal.timeout(2000) });
        setIsBackendHealthy(res.ok);
      } catch {
        setIsBackendHealthy(false);
      }
    };

    checkHealth();
    const healthTimer = setInterval(checkHealth, 10000);
    return () => clearInterval(healthTimer);
  }, [isExternal]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 text-xl border border-white/10">
          {(martName || 'M')[0].toUpperCase()}
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-white leading-none tracking-tight">
            {(martName || 'Mart Inventory').toUpperCase()}
          </h1>
          <div className="flex items-center space-x-2 mt-1">
             <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isExternal ? (isBackendHealthy ? 'bg-cyan-400' : 'bg-red-400') : 'bg-green-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isExternal ? (isBackendHealthy ? 'bg-cyan-500' : 'bg-red-500') : 'bg-green-500'}`}></span>
            </div>
            <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${isExternal ? (isBackendHealthy ? 'text-cyan-500' : 'text-red-500') : 'text-blue-500'}`}>
              {isExternal 
                ? (isBackendHealthy === false ? 'SQL OFFLINE' : 'Remote SQL') 
                : 'Local System'}
            </span>
            {isSyncing && (
              <span className="text-[8px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded animate-pulse">Syncing...</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex flex-col items-end border-r border-slate-800 pr-6 mr-2">
          <span className="text-white text-sm font-bold font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <div className="relative group">
          <button
            onClick={onLock}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-500 px-4 py-2 rounded-xl border border-slate-800 transition-all duration-200 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🔒</span>
            <span className="text-xs font-bold uppercase tracking-widest">Lock</span>
          </button>
          <div className="absolute top-full right-0 mt-2 bg-slate-800 text-[9px] text-slate-400 px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            ALT+X
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
