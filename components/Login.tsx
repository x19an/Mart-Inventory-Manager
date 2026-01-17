
import React, { useState } from 'react';

interface LoginProps {
  correctPin: string;
  onLogin: () => void;
  martName: string;
}

const Login: React.FC<LoginProps> = ({ correctPin, onLogin, martName }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin) {
      onLogin();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-500 mb-2">{martName.toUpperCase()}</h1>
          <p className="text-slate-500 text-sm tracking-widest uppercase font-medium">Secure Access Point</p>
        </div>

        <div className={`bg-slate-900 border ${error ? 'border-red-500 shadow-red-900/20' : 'border-slate-800 shadow-blue-900/10'} p-8 rounded-2xl shadow-2xl transition-all duration-300`}>
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl">
              {error ? '❌' : '🔐'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-center text-slate-400 text-sm mb-4">Enter System Access PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-center text-2xl tracking-[1em] text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                placeholder="••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-center text-sm font-medium animate-pulse">
                Invalid PIN. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-[0.98]"
            >
              Access System
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-slate-600 text-xs">
          Mart Inventory Management System v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Login;
