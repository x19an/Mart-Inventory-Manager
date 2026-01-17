
import React, { useState } from 'react';
import { Product } from '../types';

interface BulkAddProps {
  onBulkAdd: (products: Omit<Product, 'id' | 'unitsSold'>[]) => void;
  categories: string[];
}

interface BulkRow {
  name: string;
  category: string;
  price: string;
  stock: string;
  reorderLevel: string;
}

const BulkAdd: React.FC<BulkAddProps> = ({ onBulkAdd, categories }) => {
  const [defaultCategory, setDefaultCategory] = useState(categories[0] || '');
  const [rows, setRows] = useState<BulkRow[]>([
    { name: '', category: categories[0] || '', price: '', stock: '', reorderLevel: '10' }
  ]);
  const [error, setError] = useState<string | null>(null);

  const addRow = () => {
    setRows([...rows, { name: '', category: defaultCategory, price: '', stock: '', reorderLevel: '10' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  // Fixed the syntax 'key of' to 'keyof' to resolve type inference and argument errors
  const updateRow = (index: number, field: keyof BulkRow, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate rows
    const validProducts: Omit<Product, 'id' | 'unitsSold'>[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name || !row.category || !row.price || !row.stock) {
        setError(`Row ${i + 1} is incomplete. Please fill all required fields.`);
        return;
      }
      
      const price = parseFloat(row.price);
      const stock = parseInt(row.stock);
      const reorder = parseInt(row.reorderLevel || '10');

      if (isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        setError(`Row ${i + 1} has invalid numbers.`);
        return;
      }

      validProducts.push({
        name: row.name,
        category: row.category,
        price,
        stock,
        reorderLevel: reorder
      });
    }

    onBulkAdd(validProducts);
  };

  const fillAllCategories = () => {
    setRows(rows.map(r => ({ ...r, category: defaultCategory })));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg">Inventory Bulk Import</h3>
            <p className="text-slate-400 text-sm">Add multiple products to your catalog simultaneously.</p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Default Category</span>
            <select
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={fillAllCategories}
              className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg transition-all"
            >
              Apply to All
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleBulkSubmit} className="space-y-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-8 text-center">#</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reorder</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/10 transition-colors">
                    <td className="px-6 py-3 text-slate-600 text-xs font-mono text-center">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(idx, 'name', e.target.value)}
                        placeholder="Product name..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.category}
                        onChange={(e) => updateRow(idx, 'category', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 w-28">
                      <input
                        type="number"
                        step="0.01"
                        value={row.price}
                        onChange={(e) => updateRow(idx, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3 w-28">
                      <input
                        type="number"
                        value={row.stock}
                        onChange={(e) => updateRow(idx, 'stock', e.target.value)}
                        placeholder="Qty"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3 w-28">
                      <input
                        type="number"
                        value={row.reorderLevel}
                        onChange={(e) => updateRow(idx, 'reorderLevel', e.target.value)}
                        placeholder="10"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="text-slate-600 hover:text-red-500 transition-colors p-2"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-950/20 flex justify-between items-center">
            <button 
              type="button"
              onClick={addRow}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all border border-slate-700"
            >
              <span>➕ Add Row</span>
            </button>
            <div className="text-slate-500 text-xs font-medium">
              Total items to import: <span className="text-blue-400 font-bold">{rows.length}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-sm font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-900/20 transition-all flex items-center space-x-3"
          >
            <span>💾 Save Batch to Inventory</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkAdd;
