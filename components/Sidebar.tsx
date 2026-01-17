
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onExit: () => void;
  martName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onExit, martName }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: View.SELL_PRODUCT, label: 'Point of Sale', icon: '🛒' },
    { id: View.SEARCH_PRODUCTS, label: 'Inventory', icon: '🔍' },
    { id: View.ADD_PRODUCT, label: 'New Product', icon: '➕' },
    { id: View.TRANSACTION_LOG, label: 'Logs', icon: '📜' },
    { id: View.CATEGORIES, label: 'Categories', icon: '🏷️' },
    { id: View.BEST_SELLERS, label: 'Best Sellers', icon: '⭐' },
    { id: View.SETTINGS, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-6 z-10">
      <div className="mb-10 px-2">
        <div className="flex items-center space-x-3 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">M</div>
          <h1 className="text-lg font-bold text-white tracking-tight truncate">{martName.toUpperCase()}</h1>
        </div>
        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] ml-11 uppercase">Management</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center w-6 text-lg mr-3">
              {item.icon}
            </span>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800/50">
        <button
          onClick={onExit}
          className="w-full flex items-center px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <span className="flex items-center justify-center w-6 text-lg mr-3">
            🔒
          </span>
          <span className="font-semibold text-sm">Lock System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
