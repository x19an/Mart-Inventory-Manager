
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
    { 
      label: 'Inventory Search', 
      view: 'SEARCH_PRODUCTS',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    },
    { 
      label: 'Add Product', 
      view: 'ADD_PRODUCT',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    },
    { 
      label: 'Sell Product', 
      view: 'SELL_PRODUCT',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    },
    { 
      label: 'Performance', 
      view: 'BEST_SELLERS',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.5 4.511L21.75 8.25M21.75 8.25l-4.5-4.5M21.75 8.25l-4.5 4.5" />
    },
    { 
      label: 'Manage Database', 
      view: 'MANAGE_DATABASE',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.25-4.5 4.125-6.75 4.125S6.75 8.625 6.75 6.375 11.25 2.25 13.5 2.25s6.75 1.875 6.75 4.125ZM20.25 12c0 2.25-4.5 4.125-6.75 4.125s-6.75-1.875-6.75-4.125M20.25 17.625c0 2.25-4.5 4.125-6.75 4.125s-6.75-1.875-6.75-4.125" />
    },
  ];

  return (
    <aside className="w-64 h-full bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl z-10">
      <div className="p-6 border-b border-slate-700 bg-slate-800/50">
        <h1 className="text-xl font-bold text-blue-400 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M3 12v3c0 1.1.9 2 2 2h10a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2zm2-1h10a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3a1 1 0 011-1zM3 5v3c0 1.1.9 2 2 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2zm2-1h10a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"></path></svg>
          Mart Inv.
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-bold">SQL Database Mode</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              currentView === item.view 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === item.view ? 'text-white' : 'text-slate-500'}`}>
              {item.icon}
            </svg>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Local SQL storage</p>
           <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full w-[15%]"></div>
           </div>
        </div>
        <button 
          onClick={() => window.confirm('Exit the application?') && window.close()}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <span className="font-bold text-sm">Close Application</span>
        </button>
      </div>
    </aside>
  );
};
