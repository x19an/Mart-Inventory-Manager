
import React, { useState, useEffect } from 'react';

interface BootingScreenProps {
  onComplete: () => void;
  isDataLoaded: boolean;
  productCount: number;
}

const BOOT_STEPS = [
  { id: 'kernel', message: "INITIALIZING KERNEL...", progress: 10 },
  { id: 'backend', message: "CONNECTING TO SQL BACKEND...", progress: 25 },
  { id: 'indexing', message: "INDEXING ENTRIES...", progress: 45 }, // Will be replaced dynamically
  { id: 'cache', message: "OPTIMIZING MEMORY CACHE...", progress: 65 },
  { id: 'logs', message: "VERIFYING TRANSACTION LOGS...", progress: 85 },
  { id: 'dashboard', message: "PREPARING DASHBOARD...", progress: 95 },
  { id: 'ready', message: "SYSTEM READY.", progress: 100 },
];

const BootingScreen: React.FC<BootingScreenProps> = ({ onComplete, isDataLoaded, productCount }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentStep < BOOT_STEPS.length) {
      const timer = setTimeout(() => {
        // Step-specific logic
        const step = BOOT_STEPS[currentStep];
        
        // Wait for data at backend connection step
        if (step.id === 'backend' && !isDataLoaded) {
          return;
        }

        let message = step.message;
        
        // Dynamic Indexing Message
        if (step.id === 'indexing') {
          if (productCount === 0) {
            message = "INITIALIZING EMPTY DATABASE STRUCTURES...";
          } else {
            message = `INDEXING ${productCount.toLocaleString()} SKU ENTRIES...`;
          }
        }

        setLogs(prev => [...prev.slice(-4), message]);
        setCurrentStep(prev => prev + 1);
      }, currentStep === 0 ? 500 : 400);

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setIsDone(true);
        setTimeout(onComplete, 500);
      }, 500);
    }
  }, [currentStep, onComplete, isDataLoaded, productCount]);

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-500 ${isDone ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative mb-12">
        {/* Glowing Core */}
        <div className="w-24 h-24 rounded-3xl bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center animate-spin-slow">
            <span className="text-white font-black text-xl">M</span>
          </div>
        </div>
        {/* Orbital Rings */}
        <div className="absolute inset-[-20px] border border-slate-800 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-[-40px] border border-slate-900 rounded-full animate-pulse opacity-10"></div>
      </div>

      <div className="w-full max-w-sm px-8">
        <div className="mb-4 flex justify-between items-end">
          <div>
            <h2 className="text-blue-500 text-xs font-black tracking-[0.3em] uppercase">System Booting</h2>
          </div>
          <span className="text-slate-500 font-mono text-xs">
            {BOOT_STEPS[Math.min(currentStep, BOOT_STEPS.length - 1)].progress}%
          </span>
        </div>

        {/* Primary Animated Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-8">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-500 ease-out"
            style={{ width: `${BOOT_STEPS[Math.min(currentStep, BOOT_STEPS.length - 1)].progress}%` }}
          ></div>
        </div>

        {/* Terminal Logs */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl font-mono text-[10px] space-y-1.5 min-h-[100px]">
          {logs.map((log, i) => (
            <div key={i} className={`${i === logs.length - 1 ? 'text-blue-400' : 'text-slate-600'}`}>
              <span className="mr-2 opacity-30">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              {log}
            </div>
          ))}
          {currentStep < BOOT_STEPS.length && (
            <div className="text-blue-500 animate-pulse">_</div>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 text-center">
        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.5em]">Mart Management Engine v1.2.0</p>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BootingScreen;
