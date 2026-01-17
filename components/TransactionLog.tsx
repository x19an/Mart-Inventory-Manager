
import React, { useState, useMemo } from 'react';
import { Transaction, Settings } from '../types';

interface TransactionLogProps {
  transactions: Transaction[];
  settings: Settings;
}

const TransactionLog: React.FC<TransactionLogProps> = ({ transactions, settings }) => {
  const [visibleCount, setVisibleCount] = useState(100);

  // Sort and limit logic
  const sortedLogs = useMemo(() => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const displayedLogs = useMemo(() => {
    return sortedLogs.slice(0, visibleCount);
  }, [sortedLogs, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 100);
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
                  <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
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
                      <div className="text-slate-500 font-mono text-[10px]">{log.productId}</div>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sortedLogs.length > visibleCount && (
          <div className="p-6 bg-slate-950/30 border-t border-slate-700 flex flex-col items-center space-y-3">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Showing {visibleCount} of {sortedLogs.length} transactions
            </p>
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-500 text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              View Older Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLog;
