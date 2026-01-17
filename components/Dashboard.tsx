
import React, { useState } from 'react';
import { Product, Transaction, Settings, View } from '../types';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  settings: Settings;
  onViewChange: (view: View) => void;
  onRefresh?: () => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ products, transactions, settings, onViewChange, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const today = new Date().setHours(0, 0, 0, 0);
  const salesToday = transactions.filter(t => t.type === 'SALE' && t.timestamp >= today);
  const revenueToday = salesToday.reduce((sum, t) => sum + (t.total || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) <= (p.reorderLevel || 0));
  
  // Optimization: Dashboard should only show the most critical low stock items
  const lowStockWatchlist = lowStockProducts.slice(0, 20);

  const stats = [
    { label: "Today's Revenue", value: `${settings.currency} ${revenueToday.toLocaleString()}`, icon: "💰", color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Sales Count", value: salesToday.length.toString(), icon: "🧾", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Low Stock Items", value: lowStockProducts.length.toString(), icon: "⚠️", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Total Products", value: products.length.toString(), icon: "📦", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const handleRecalculate = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      // Small delay for visual feedback if refresh is too fast
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Safe calculation for total inventory value
  const totalInventoryValue = products.reduce((sum, p) => {
    const price = p.price || 0;
    const stock = p.stock || 0;
    return sum + (price * stock);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${stat.color}`}>Real-time</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Watchlist */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center">
              <span className="mr-2">🚨</span> Low Stock Alerts
              {lowStockProducts.length > 20 && (
                <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">Showing Critical 20</span>
              )}
            </h3>
            <button onClick={() => onViewChange(View.SEARCH_PRODUCTS)} className="text-blue-400 text-xs hover:underline">View All</button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {lowStockWatchlist.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-center">Stock</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {lowStockWatchlist.map(p => (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-200 text-sm font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{p.category}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-400 font-bold">{p.stock || 0}</span>
                        <span className="text-slate-600 text-[10px] ml-1">/ {p.reorderLevel || 10}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onViewChange(View.SEARCH_PRODUCTS)}
                          className="text-blue-400 text-xs font-bold border border-blue-400/30 px-3 py-1 rounded hover:bg-blue-400 hover:text-white transition-all"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">✅</div>
                <div className="text-slate-400 text-sm">All products are well stocked!</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">Inventory Value</h3>
              <button 
                onClick={handleRecalculate}
                title="Recalculate current value"
                className={`p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="text-3xl font-bold mb-4">
              {settings.currency} {totalInventoryValue.toLocaleString()}
            </div>
            <p className="text-blue-100 text-xs leading-relaxed opacity-80">
              This represents the total retail value of your current stock across all categories.
            </p>
            {isRefreshing && (
              <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-[10px] font-black tracking-widest animate-pulse">RECALCULATING...</span>
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-white font-bold mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => onViewChange(View.SELL_PRODUCT)}
                className="p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-blue-500 transition-all flex flex-col items-center group text-center"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform">💰</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase">Sale</span>
              </button>
              <button 
                onClick={() => onViewChange(View.ADD_PRODUCT)}
                className="p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-green-500 transition-all flex flex-col items-center group text-center"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform">➕</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase">Add</span>
              </button>
              <button 
                onClick={() => onViewChange(View.BULK_ADD)}
                className="p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-purple-500 transition-all flex flex-col items-center group text-center"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📥</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase">Bulk</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
