
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
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-500 pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search products by Name, Category, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-blue-400">{p.id}</td>
                    <td className="px-6 py-4 text-slate-100 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{p.category}</td>
                    <td className="px-6 py-4 text-right text-slate-100 font-mono">{currency} {p.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${p.stock <= p.reorderLevel ? 'text-red-400' : 'text-slate-100'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.stock <= p.reorderLevel ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-red-950/30 text-red-500 border border-red-900 rounded-full uppercase">Low Stock</span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-green-950/30 text-green-500 border border-green-900 rounded-full uppercase">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onEdit(p)}
                        className="px-4 py-1.5 bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all"
                      >
                        EDIT
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
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

export default SearchProducts;
