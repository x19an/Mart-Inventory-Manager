
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  adminName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, adminName }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Overview', icon: '📊' },
    { id: View.SELL_PRODUCT, label: 'Checkout', icon: '🛒' },
    { id: View.SEARCH_PRODUCTS, label: 'Inventory', icon: '📦' },
    { id: View.ADD_PRODUCT, label: 'New Item', icon: '➕' },
    { id: View.BULK_ADD, label: 'Bulk Add', icon: '📥' },
    { id: View.TRANSACTION_LOG, label: 'Transactions', icon: '📜' },
    { id: View.CATEGORIES, label: 'Categories', icon: '🏷️' },
    { id: View.BEST_SELLERS, label: 'Analytics', icon: '⭐' },
    { id: View.SETTINGS, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-950 border-r border-slate-900 flex flex-col p-4 z-40 overflow-y-auto scrollbar-hide">
      <div className="mb-4 px-2 py-4">
        <p className="text-[10px] text-slate-600 font-bold tracking-[0.2em] uppercase">Main Menu</p>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className={`flex items-center justify-center w-6 text-xl mr-3 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_8px_rgba(147,197,253,0.8)]"></div>
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 mt-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">👤</div>
          <div className="flex flex-col min-w-0">
            <span className="text-white text-xs font-bold truncate">{adminName || 'Admin User'}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Root Access</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
