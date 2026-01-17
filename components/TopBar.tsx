
import React, { useState, useEffect } from 'react';

interface TopBarProps {
  martName: string;
  onLock: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ martName, onLock }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-6">
      {/* Brand Identity - Fixes visibility by putting it top-left */}
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 text-xl border border-white/10">
          {(martName || 'M')[0].toUpperCase()}
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-white leading-none tracking-tight">
            {(martName || 'Mart Inventory').toUpperCase()}
          </h1>
          <span className="text-[10px] text-blue-500 font-bold tracking-[0.3em] uppercase mt-1">
            Official System
          </span>
        </div>
      </div>

      {/* System Status & Actions */}
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex flex-col items-end border-r border-slate-800 pr-6 mr-2">
          <span className="text-white text-sm font-bold font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <button
          onClick={onLock}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-500 px-4 py-2 rounded-xl border border-slate-800 transition-all duration-200 group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">🔒</span>
          <span className="text-xs font-bold uppercase tracking-widest">Lock</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
