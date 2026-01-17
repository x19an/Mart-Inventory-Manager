
import React, { useMemo, useState } from 'react';
import { Product, Transaction } from '../types';

interface BestSellersProps {
  products: Product[];
  transactions: Transaction[];
  currency: string;
}

type ChartMode = 'revenue' | 'units';

export const BestSellers: React.FC<BestSellersProps> = ({ products, transactions, currency }) => {
  const [chartMode, setChartMode] = useState<ChartMode>('units');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Constants
  const CHART_HEIGHT = 220;
  const CHART_WIDTH = 800;
  const DAYS_TO_SHOW = 7;

  // 1. Calculate Core KPI Metrics
  const metrics = useMemo(() => {
    const sales = transactions.filter(t => t.type === 'SALE');
    const totalRev = sales.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalUnits = sales.reduce((sum, t) => sum + t.quantity, 0);
    
    // Avg Order Value (By Checkout ID)
    const uniqueCheckouts = new Set(sales.map(t => t.checkoutId)).size;
    const aov = uniqueCheckouts > 0 ? totalRev / uniqueCheckouts : 0;

    // Category Performance
    const catRevenue: Record<string, number> = {};
    sales.forEach(t => {
      const p = products.find(prod => prod.id === t.productId);
      const cat = p?.category || 'Unknown';
      catRevenue[cat] = (catRevenue[cat] || 0) + (t.total || 0);
    });

    const topCategory = Object.entries(catRevenue).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    return { totalRev, totalUnits, aov, topCategory, catRevenue };
  }, [transactions, products]);

  // 2. Process Trend Data
  const trendData = useMemo(() => {
    const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (DAYS_TO_SHOW - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const salesInWindow = transactions.filter(t => t.type === 'SALE' && t.timestamp >= dates[0].getTime());
    
    const topProductIds = [...products]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
      .map(p => p.id);

    const dailyData = dates.map(date => {
      const start = date.getTime();
      const end = start + 86400000;
      const daySales = salesInWindow.filter(t => t.timestamp >= start && t.timestamp < end);
      
      const values: Record<string, number> = {};
      topProductIds.forEach(id => {
        const pSales = daySales.filter(t => t.productId === id);
        values[id] = chartMode === 'units' 
          ? pSales.reduce((s, t) => s + t.quantity, 0)
          : pSales.reduce((s, t) => s + (t.total || 0), 0);
      });

      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        fullLabel: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        values
      };
    });

    const maxVal = Math.max(...dailyData.flatMap(d => Object.values(d.values)), 10);

    return { dailyData, topProductIds, maxVal: maxVal * 1.15 };
  }, [transactions, products, chartMode]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 text-2xl font-bold">💰</div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
          </div>
          <div className="text-2xl font-black text-white">{currency} {metrics.totalRev.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">All-time Gross Sales</div>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500 text-2xl font-bold">📦</div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume</span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalUnits.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Total Items Sold</div>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 text-2xl font-bold">💳</div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Sale</span>
          </div>
          <div className="text-2xl font-black text-white">{currency} {Math.round(metrics.aov).toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Value per Transaction</div>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 text-2xl font-bold">⭐</div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top Dept</span>
          </div>
          <div className="text-2xl font-black text-white truncate pr-2">{metrics.topCategory[0]}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">{currency} {Math.round(Number(metrics.topCategory[1])).toLocaleString()} Earned</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg">Sales Performance Trend</h3>
              <p className="text-slate-400 text-xs">Comparison of top 5 moving products</p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button 
                onClick={() => setChartMode('units')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'units' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >Units</button>
              <button 
                onClick={() => setChartMode('revenue')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'revenue' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >Revenue</button>
            </div>
          </div>

          <div className="relative w-full aspect-[800/280]">
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + 40}`} className="w-full h-full overflow-visible">
              {/* Y Axis lines */}
              {[0, 0.5, 1].map((v, i) => (
                <g key={i}>
                  <line x1="0" y1={CHART_HEIGHT * (1-v)} x2={CHART_WIDTH} y2={CHART_HEIGHT * (1-v)} stroke="#334155" strokeDasharray="4 4" />
                  <text x="-10" y={CHART_HEIGHT * (1-v) + 4} fill="#64748b" fontSize="10" textAnchor="end">
                    {Math.round(trendData.maxVal * v)}
                  </text>
                </g>
              ))}

              {/* Data Lines */}
              {trendData.topProductIds.map((id, pIdx) => {
                const points = trendData.dailyData.map((d, dIdx) => {
                  const x = (CHART_WIDTH / (DAYS_TO_SHOW - 1)) * dIdx;
                  const y = CHART_HEIGHT - (d.values[id] / trendData.maxVal) * CHART_HEIGHT;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <g key={id}>
                    <polyline fill="none" stroke={colors[pIdx]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} className="transition-all duration-500" />
                    {trendData.dailyData.map((d, dIdx) => (
                      <circle 
                        key={dIdx} 
                        cx={(CHART_WIDTH / (DAYS_TO_SHOW - 1)) * dIdx} 
                        cy={CHART_HEIGHT - (d.values[id] / trendData.maxVal) * CHART_HEIGHT} 
                        r="4" fill="#1e293b" stroke={colors[pIdx]} strokeWidth="2"
                        className="cursor-pointer"
                        onMouseEnter={(e) => setHoveredPoint({
                          x: (CHART_WIDTH / (DAYS_TO_SHOW - 1)) * dIdx,
                          y: CHART_HEIGHT - (d.values[id] / trendData.maxVal) * CHART_HEIGHT,
                          val: d.values[id],
                          name: products.find(p => p.id === id)?.name,
                          date: d.fullLabel,
                          color: colors[pIdx]
                        })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </g>
                );
              })}

              {/* X Axis labels */}
              {trendData.dailyData.map((d, i) => (
                <text key={i} x={(CHART_WIDTH / (DAYS_TO_SHOW - 1)) * i} y={CHART_HEIGHT + 25} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {d.label}
                </text>
              ))}
            </svg>

            {hoveredPoint && (
              <div 
                className="absolute z-10 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl pointer-events-none animate-in fade-in zoom-in duration-200"
                style={{ left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`, top: `${(hoveredPoint.y / (CHART_HEIGHT + 40)) * 100}%`, transform: 'translate(-50%, -100%)' }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredPoint.color }}></div>
                  <span className="text-white text-[10px] font-bold whitespace-nowrap">{hoveredPoint.name}</span>
                </div>
                <div className="text-slate-500 text-[10px] mb-2">{hoveredPoint.date}</div>
                <div className="text-white font-black text-sm">
                  {chartMode === 'revenue' ? currency : ''} {hoveredPoint.val.toLocaleString()} {chartMode === 'units' ? 'pcs' : ''}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4 pt-4 border-t border-slate-700/50">
            {trendData.topProductIds.map((id, idx) => (
              <div key={id} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx] }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {products.find(p => p.id === id)?.name.substring(0, 15)}...
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-white font-bold text-lg mb-2">Dept. Revenue</h3>
          <p className="text-slate-400 text-xs mb-8">Earning share by product category</p>
          
          <div className="space-y-6">
            {Object.entries(metrics.catRevenue)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([name, rev]) => {
                const percentage = Math.round((rev / metrics.totalRev) * 100) || 0;
                return (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-300 text-xs font-bold">{name}</span>
                      <span className="text-white text-[10px] font-mono">{currency} {rev.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          <div className="mt-12 p-4 bg-slate-950/40 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Efficiency Metric</div>
            <div className="text-slate-200 text-sm font-medium">
              {Object.keys(metrics.catRevenue).length} Departments active.
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-950/20 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold">SKU Performance Leaderboard</h3>
            <p className="text-slate-500 text-xs">Analysis of high-contribution inventory</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product SKU</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Volume</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {[...products].sort((a,b) => b.unitsSold - a.unitsSold).slice(0, 15).map((p, idx) => {
                const revenue = p.unitsSold * p.price;
                const contribution = ((revenue / metrics.totalRev) * 100).toFixed(1);
                
                return (
                  <tr key={p.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                        idx < 3 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm font-bold">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">#{p.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-blue-400 font-bold">{p.unitsSold.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-500 font-mono text-sm">{currency} {revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-xs font-black text-slate-200">{contribution}%</span>
                        <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${contribution}%` }}></div>
                        </div>
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

export default BestSellers;
