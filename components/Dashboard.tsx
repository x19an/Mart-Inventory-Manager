
import React from 'react';
import { Product, Transaction, Settings, View } from '../types';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  settings: Settings;
  onViewChange: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, transactions, settings, onViewChange }) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const salesToday = transactions.filter(t => t.type === 'SALE' && t.timestamp >= today);
  const revenueToday = salesToday.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalRevenue = transactions.filter(t => t.type === 'SALE').reduce((sum, t) => sum + (t.total || 0), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel);

  const stats = [
    { label: "Today's Revenue", value: `${settings.currency} ${revenueToday.toLocaleString()}`, icon: "💰", color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Sales Count", value: salesToday.length.toString(), icon: "🧾", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Low Stock Items", value: lowStockProducts.length.toString(), icon: "⚠️", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Total Products", value: products.length.toString(), icon: "📦", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

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
            </h3>
            <button onClick={() => onViewChange(View.SEARCH_PRODUCTS)} className="text-blue-400 text-xs hover:underline">View All</button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {lowStockProducts.length > 0 ? (
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
                  {lowStockProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-200 text-sm font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{p.category}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-400 font-bold">{p.stock}</span>
                        <span className="text-slate-600 text-[10px] ml-1">/ {p.reorderLevel}</span>
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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl text-white">
            <h3 className="font-bold text-lg mb-2">Inventory Value</h3>
            <div className="text-3xl font-bold mb-4">
              {settings.currency} {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
            </div>
            <p className="text-blue-100 text-xs leading-relaxed opacity-80">
              This represents the total retail value of your current stock across all categories.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-white font-bold mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onViewChange(View.SELL_PRODUCT)}
                className="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-blue-500 transition-all flex flex-col items-center group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">💰</span>
                <span className="text-xs text-slate-300 font-bold">New Sale</span>
              </button>
              <button 
                onClick={() => onViewChange(View.ADD_PRODUCT)}
                className="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-green-500 transition-all flex flex-col items-center group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                <span className="text-xs text-slate-300 font-bold">Add Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
