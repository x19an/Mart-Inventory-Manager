
import React, { useState } from 'react';
import { Settings } from '../types';

interface SettingsManagerProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, setSettings }) => {
  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setMessage('Settings updated successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-700 text-green-400 font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Store Info Section */}
          <div>
            <h3 className="text-blue-500 font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Store Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mart Name</label>
                <input
                  type="text"
                  name="martName"
                  value={formData.martName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Store Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Contact No.</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div>
            <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">System Security</h3>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">System Access PIN</label>
              <input
                type="password"
                name="accessPin"
                value={formData.accessPin}
                onChange={handleChange}
                placeholder="Leave blank to disable login gate"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
              <p className="mt-2 text-xs text-slate-500">
                This PIN will be required every time the application is opened or manually locked.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Save All Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsManager;
