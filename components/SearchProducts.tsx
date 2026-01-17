
import React, { useState } from 'react';
import { Product } from '../types';

interface SearchProductsProps {
  products: Product[];
  onEdit: (product: Product) => void;
  currency: string;
}

const SearchProducts: React.FC<SearchProductsProps> = ({ products, onEdit, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-500">🔍</span>
          <input
            type="text"
            placeholder="Search by Name, Category, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Unit Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const stockPercentage = Math.min(100, (p.stock / (p.reorderLevel * 2)) * 100);
                  const isLow = p.stock <= p.reorderLevel;

                  return (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-slate-100 font-bold mb-0.5">{p.name}</div>
                        <div className="text-slate-500 font-mono text-[10px] uppercase">{p.id}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-400 rounded-full">{p.category}</span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-slate-200">
                        {currency} {p.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-1.5 bg-slate-900 rounded-full mb-2 overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full transition-all duration-500 ${isLow ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`} 
                              style={{ width: `${stockPercentage}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold ${isLow ? 'text-red-400' : 'text-slate-400'}`}>
                            {p.stock} <span className="text-[10px] font-normal opacity-50">PCS</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => onEdit(p)}
                          className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-blue-500"
                        >
                          EDIT
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="text-slate-500 italic text-sm">No products found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchProducts;
