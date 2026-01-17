
import React, { useMemo, useState } from 'react';
import { Product } from '../types';

interface BestSellersViewProps {
  products: Product[];
}

export const BestSellersView: React.FC<BestSellersViewProps> = ({ products }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bestSellers = useMemo(() => {
    return [...products].sort((a, b) => b.salesCount - a.salesCount);
  }, [products]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white">Best Selling Products</h2>
          <p className="text-sm text-slate-400">Products sorted by total units sold</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span className="font-medium text-sm">Refresh Analytics</span>
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {bestSellers.slice(0, 3).map((p, idx) => (
          <div key={p.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-300' : 'bg-orange-400'}`} />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Rank #{idx + 1}</p>
                <h3 className="text-lg font-bold text-white mt-1">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.category}</p>
              </div>
              <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">
                {p.salesCount} Sold
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Total Sales</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Revenue</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {bestSellers.map(p => {
                const maxSales = Math.max(...products.map(item => item.salesCount));
                const percentage = (p.salesCount / maxSales) * 100;
                
                return (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 uppercase">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-400">{p.salesCount}</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-medium">${(p.salesCount * p.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <div className="w-24 h-1.5 bg-slate-900 rounded-full mr-3">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold w-6">{Math.round(percentage)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
