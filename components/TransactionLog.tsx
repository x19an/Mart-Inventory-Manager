
import React, { useState, useMemo } from 'react';
import { Transaction, Settings } from '../types';

interface TransactionLogProps {
  transactions: Transaction[];
  settings: Settings;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TransactionLog: React.FC<TransactionLogProps> = ({ transactions, settings }) => {
  const [visibleCount, setVisibleCount] = useState(100);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Extract unique years from transactions for the filter
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    transactions.forEach(t => {
      const year = new Date(t.timestamp).getFullYear().toString();
      years.add(year);
    });
    // Ensure current year is always an option if it's not in transactions
    years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [transactions]);

  // Filtering and Sorting logic
  const processedLogs = useMemo(() => {
    let filtered = [...transactions];

    // Apply Date Filters
    filtered = filtered.filter(log => {
      const date = new Date(log.timestamp);
      const logYear = date.getFullYear().toString();
      const logMonth = date.getMonth().toString(); // 0-11
      const logDay = date.getDate().toString();

      const yearMatch = selectedYear === 'All' || logYear === selectedYear;
      const monthMatch = selectedMonth === 'All' || logMonth === selectedMonth;
      const dayMatch = selectedDay === 'All' || logDay === selectedDay;

      return yearMatch && monthMatch && dayMatch;
    });

    // Sort by timestamp
    return filtered.sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.timestamp - a.timestamp 
        : a.timestamp - b.timestamp;
    });
  }, [transactions, selectedYear, selectedMonth, selectedDay, sortOrder]);

  const displayedLogs = useMemo(() => {
    return processedLogs.slice(0, visibleCount);
  }, [processedLogs, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 100);
  };

  const clearFilters = () => {
    setSelectedYear('All');
    setSelectedMonth('All');
    setSelectedDay('All');
    setVisibleCount(100);
  };

  const getTypeStyle = (type: Transaction['type']) => {
    switch (type) {
      case 'SALE':
        return 'bg-green-950/30 text-green-500 border-green-900';
      case 'STOCK_ADD':
        return 'bg-blue-950/30 text-blue-500 border-blue-900';
      case 'STOCK_ADJUST':
        return 'bg-orange-950/30 text-orange-500 border-orange-900';
      default:
        return 'bg-slate-900 text-slate-500 border-slate-800';
    }
  };

  const getTypeName = (type: Transaction['type']) => {
    switch (type) {
      case 'SALE': return 'SALE';
      case 'STOCK_ADD': return 'NEW PRODUCT';
      case 'STOCK_ADJUST': return 'ADJUSTMENT';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Toolbar */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
        <div className="flex flex-col lg:flex-row items-end gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setVisibleCount(100); }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Month</label>
              <select 
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setVisibleCount(100); }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Months</option>
                {MONTHS.map((month, idx) => (
                  <option key={month} value={idx.toString()}>{month}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Day</label>
              <select 
                value={selectedDay}
                onChange={(e) => { setSelectedDay(e.target.value); setVisibleCount(100); }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Days</option>
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <button
              onClick={() => { setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}
              className="flex-1 lg:flex-none bg-slate-900 hover:bg-slate-850 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center justify-center space-x-2"
            >
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              <span className={`transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}>↓</span>
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 lg:flex-none bg-slate-900 hover:bg-slate-850 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-500 hover:text-white text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition-colors animate-in fade-in duration-300">
                    <td className="px-6 py-4">
                      <div className="text-slate-100 text-sm font-medium">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-100 font-medium">{log.productName}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-mono text-[10px] uppercase tracking-tighter">{log.productId}</span>
                        {log.checkoutId && (
                          <span className="text-slate-600 font-mono text-[9px] border border-slate-700 px-1 rounded">REF: {log.checkoutId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-full uppercase ${getTypeStyle(log.type)}`}>
                        {getTypeName(log.type)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${log.type === 'SALE' ? 'text-red-400' : 'text-green-400'}`}>
                      {log.type === 'SALE' ? '-' : '+'}{log.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-100 font-mono">
                      {log.total ? `${settings.currency} ${log.total.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <div className="text-slate-500 italic text-sm">
                      No transactions found for the selected date period.
                    </div>
                    <button 
                      onClick={clearFilters}
                      className="mt-4 text-blue-500 text-xs font-bold hover:underline"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {processedLogs.length > visibleCount && (
          <div className="p-6 bg-slate-950/30 border-t border-slate-700 flex flex-col items-center space-y-3">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Showing {visibleCount} of {processedLogs.length} transactions
            </p>
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-500 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg"
            >
              View More Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLog;
