
import React, { useState } from 'react';

interface SellProductViewProps {
  onSell: (idOrName: string, quantity: number) => { success: boolean; message: string };
}

export const SellProductView: React.FC<SellProductViewProps> = ({ onSell }) => {
  const [idOrName, setIdOrName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOrName || !quantity) {
      setStatus({ message: "Please enter product name/ID and quantity.", type: 'error' });
      return;
    }

    const result = onSell(idOrName, parseInt(quantity));
    setStatus({ message: result.message, type: result.success ? 'success' : 'error' });

    if (result.success) {
      setIdOrName('');
      setQuantity('');
    }

    setTimeout(() => setStatus({ message: '', type: null }), 4000);
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-slate-700 pb-4">Sell Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Product ID or Name</label>
          <input
            value={idOrName}
            onChange={(e) => setIdOrName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Search by ID or Name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Quantity to Sell</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="0"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
        >
          Confirm Sale
        </button>

        {status.message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium text-center transition-all ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
};
