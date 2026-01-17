
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface SearchProductsViewProps {
  products: Product[];
}

export const SearchProductsView: React.FC<SearchProductsViewProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white">Product Search</h2>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Search by name, category, or ID..."
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Qty</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">{p.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-900 rounded-md text-xs text-slate-300">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-400 font-medium">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-slate-300">{p.quantity}</td>
                  <td className="px-6 py-4">
                    {p.quantity <= p.reorderLevel ? (
                      <span className="flex items-center text-rose-400 text-xs font-bold uppercase">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
                        Low Stock
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-400 text-xs font-bold uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    No products found matching your search.
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
