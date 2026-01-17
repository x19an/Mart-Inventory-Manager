
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
    { id: View.ADD_PRODUCT, label: 'Add Product', icon: '📦' },
    { id: View.SELL_PRODUCT, label: 'Sell Product', icon: '💰' },
    { id: View.SEARCH_PRODUCTS, label: 'Search Products', icon: '🔍' },
    { id: View.TRANSACTION_LOG, label: 'Transaction Log', icon: '📜' },
    { id: View.CATEGORIES, label: 'Categories', icon: '🏷️' },
    { id: View.BEST_SELLERS, label: 'Best Sellers', icon: '⭐' },
    { id: View.SETTINGS, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-6 z-10">
      <div className="mb-10 px-2 overflow-hidden">
        <h1 className="text-xl font-bold text-blue-500 tracking-tight truncate">{martName.toUpperCase()}</h1>
        <p className="text-xs text-slate-500 font-medium tracking-widest">MANAGEMENT SYSTEM</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center w-8 text-lg mr-3">
              {item.icon}
            </span>
            <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800">
        <button
          onClick={onExit}
          className="w-full flex items-center px-3 py-3 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          <span className="flex items-center justify-center w-8 text-xl mr-3">
            🔒
          </span>
          <span className="font-medium text-sm">Lock System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
