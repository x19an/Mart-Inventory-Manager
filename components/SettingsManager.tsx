
import React, { useState, useRef } from 'react';
import { Settings, MasterData } from '../types';

interface SettingsManagerProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  fullData: MasterData;
  onImport: (data: MasterData) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, setSettings, fullData, onImport }) => {
  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setMessage({ text: 'Settings updated successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(fullData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `mart_backup_${timestamp}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Backup file generated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: 'Failed to generate backup.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content) as MasterData;

        if (!importedData.products || !Array.isArray(importedData.products)) {
          throw new Error('Invalid backup file format.');
        }

        if (window.confirm('Warning: Importing data will overwrite all current inventory. Continue?')) {
          onImport(importedData);
          setFormData({ ...importedData.settings });
          setMessage({ text: 'Database restored successfully!', type: 'success' });
          setTimeout(() => setMessage(null), 3000);
        }
      } catch (err) {
        setMessage({ text: 'Error importing file. Ensure it is a valid .db backup.', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 max-w-2xl pb-20">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        {message && (
          <div className={`mb-6 p-4 rounded-lg border font-medium ${
            message.type === 'success' 
              ? 'bg-green-900/20 border-green-700 text-green-400' 
              : 'bg-red-900/20 border-red-700 text-red-400'
          }`}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-blue-500 font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Store Profile</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-slate-400 mb-2">Admin Name</label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
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
            </div>
          </div>

          <div>
            <h3 className="text-cyan-500 font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">SQL / Cloud Connectivity</h3>
            <div className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-slate-200">Connect to External SQL API</label>
                  <p className="text-[10px] text-slate-500">Enable this to sync data with a remote database server.</p>
                </div>
                <input
                  type="checkbox"
                  name="useExternalDB"
                  checked={formData.useExternalDB}
                  onChange={handleChange}
                  className="w-6 h-6 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              {formData.useExternalDB && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-slate-400 mb-2">API Endpoint URL</label>
                  <input
                    type="text"
                    name="apiEndpoint"
                    value={formData.apiEndpoint}
                    onChange={handleChange}
                    placeholder="http://localhost:5000/api"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                  <p className="mt-2 text-[10px] text-slate-500 italic">
                    Requires a Backend API (Node.js/Python) to bridge the browser and your SQL Server.
                  </p>
                </div>
              )}
            </div>
          </div>

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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-mono"
              />
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

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <h3 className="text-purple-500 font-bold text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Local Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold">Manual Backup</h4>
            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-blue-600/10 border border-slate-700 hover:border-blue-500 text-blue-500 py-3 rounded-lg transition-all font-bold"
            >
              <span>💾</span>
              <span>Download .db File</span>
            </button>
          </div>
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold">Restore Database</h4>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".db" className="hidden" />
            <button
              onClick={handleImportClick}
              className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-purple-600/10 border border-slate-700 hover:border-purple-500 text-purple-500 py-3 rounded-lg transition-all font-bold"
            >
              <span>📂</span>
              <span>Import .db File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
