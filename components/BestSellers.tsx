
import React, { useMemo, useState } from 'react';
import { Product, Transaction } from '../types';

interface BestSellersProps {
  products: Product[];
  transactions: Transaction[];
  currency: string;
}

interface HoverState {
  productId: string;
  dayIdx: number;
  x: number;
  y: number;
  value: number;
  productName: string;
  dateLabel: string;
  color: string;
}

const BestSellers: React.FC<BestSellersProps> = ({ products, transactions, currency }) => {
  const [hoveredPoint, setHoveredPoint] = useState<HoverState | null>(null);

  // Constants for Chart
  const CHART_HEIGHT = 200;
  const CHART_WIDTH = 800;
  const PADDING = 40;
  const DAYS_TO_SHOW = 7;

  // Process data for the top 10 table
  const topTenProducts = useMemo(() => 
    [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10)
  , [products]);

  // Process data for the 7-day trend chart
  const trendData = useMemo(() => {
    const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (DAYS_TO_SHOW - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const sevenDaysAgo = dates[0].getTime();
    const recentSales = transactions.filter(t => t.type === 'SALE' && t.timestamp >= sevenDaysAgo);
    
    const totalsPerProduct: Record<string, { name: string, total: number }> = {};
    recentSales.forEach(t => {
      if (!totalsPerProduct[t.productId]) {
        totalsPerProduct[t.productId] = { name: t.productName, total: 0 };
      }
      totalsPerProduct[t.productId].total += t.quantity;
    });

    const topFiveIds = Object.entries(totalsPerProduct)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5)
      .map(([id]) => id);

    const dailyData = dates.map(date => {
      const dayStart = date.getTime();
      const dayEnd = dayStart + 86400000;
      const daySales = recentSales.filter(t => t.timestamp >= dayStart && t.timestamp < dayEnd);
      
      const productVolumes: Record<string, number> = {};
      topFiveIds.forEach(id => {
        productVolumes[id] = daySales
          .filter(t => t.productId === id)
          .reduce((sum, t) => sum + t.quantity, 0);
      });

      return {
        dateLabel: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
        dayName: date.toLocaleDateString(undefined, { weekday: 'short' }),
        volumes: productVolumes
      };
    });

    const maxVol = Math.max(...dailyData.flatMap(d => Object.values(d.volumes)), 5);

    return {
      dailyData,
      topFiveIds,
      productInfo: totalsPerProduct,
      maxVol: maxVol * 1.2
    };
  }, [transactions]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Sales Trend Chart */}
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-white font-bold text-lg">Daily Sales Trend</h3>
            <p className="text-slate-400 text-sm">Hover over points to see exact daily volume</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-end">
            {trendData.topFiveIds.map((id, idx) => (
              <div 
                key={id} 
                className={`flex items-center space-x-2 transition-opacity duration-300 ${hoveredPoint && hoveredPoint.productId !== id ? 'opacity-30' : 'opacity-100'}`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }}></div>
                <span className="text-xs text-slate-300 font-medium">{trendData.productInfo[id]?.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* aspect-[800/240] ensures coordinates mapping is 1:1 between SVG and Div for tooltip centering */}
        <div className="relative w-full aspect-[800/240]">
          {trendData.dailyData.length > 0 ? (
            <>
              <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + PADDING}`} className="w-full h-full overflow-visible">
                {/* Y-Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
                  <g key={i}>
                    <line 
                      x1="0" 
                      y1={CHART_HEIGHT * (1 - tick)} 
                      x2={CHART_WIDTH} 
                      y2={CHART_HEIGHT * (1 - tick)} 
                      stroke="#334155" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x="-10" 
                      y={CHART_HEIGHT * (1 - tick) + 4} 
                      fill="#64748b" 
                      fontSize="10" 
                      textAnchor="end"
                    >
                      {Math.round(trendData.maxVol * tick)}
                    </text>
                  </g>
                ))}

                {/* X-Axis Labels */}
                {trendData.dailyData.map((day, i) => (
                  <text 
                    key={i}
                    x={(CHART_WIDTH / (DAYS_TO_SHOW - 1)) * i} 
                    y={CHART_HEIGHT + 25} 
                    fill="#64748b" 
                    fontSize="12" 
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {day.dayName}
                  </text>
                ))}

                {/* Product Lines */}
                {trendData.topFiveIds.map((id, pIdx) => {
                  const points = trendData.dailyData.map((day, dIdx) => {
                    const x = (CHART_WIDTH / (DAYS_TO_SHOW - 1)) * dIdx;
                    const y = CHART_HEIGHT - (day.volumes[id] / trendData.maxVol) * CHART_HEIGHT;
                    return `${x},${y}`;
                  }).join(' ');

                  const isLineHovered = hoveredPoint?.productId === id;

                  return (
                    <g key={id} className="transition-opacity duration-300" style={{ opacity: hoveredPoint && !isLineHovered ? 0.15 : 1 }}>
                      <polyline
                        fill="none"
                        stroke={colors[pIdx]}
                        strokeWidth={isLineHovered ? "4" : "2.5"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="transition-all duration-300"
                      />
                      
                      {/* Points Interaction Layer */}
                      {trendData.dailyData.map((day, dIdx) => {
                         const x = (CHART_WIDTH / (DAYS_TO_SHOW - 1)) * dIdx;
                         const y = CHART_HEIGHT - (day.volumes[id] / trendData.maxVol) * CHART_HEIGHT;
                         const isPointHovered = hoveredPoint?.productId === id && hoveredPoint?.dayIdx === dIdx;

                         return (
                           <g key={`${id}-${dIdx}`}>
                             <circle 
                               cx={x} cy={y} r="18" 
                               fill="transparent" 
                               className="cursor-crosshair"
                               onMouseEnter={() => setHoveredPoint({
                                 productId: id,
                                 dayIdx: dIdx,
                                 x, y,
                                 value: day.volumes[id],
                                 productName: trendData.productInfo[id].name,
                                 dateLabel: day.dateLabel,
                                 color: colors[pIdx]
                               })}
                               onMouseLeave={() => setHoveredPoint(null)}
                             />
                             <circle 
                               cx={x} cy={y} 
                               r={isPointHovered ? "6" : "4"} 
                               fill={isPointHovered ? colors[pIdx] : "#1e293b"} 
                               stroke={colors[pIdx]} 
                               strokeWidth="2"
                               className="pointer-events-none transition-all duration-200"
                               style={{ filter: isPointHovered ? `drop-shadow(0 0 8px ${colors[pIdx]})` : 'none' }}
                             />
                           </g>
                         );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {hoveredPoint && (
                <div 
                  className="absolute z-50 pointer-events-none bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl animate-in fade-in zoom-in duration-200 min-w-[120px] text-center flex flex-col items-center"
                  style={{ 
                    left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`, 
                    top: `${(hoveredPoint.y / (CHART_HEIGHT + PADDING)) * 100}%`,
                    transform: 'translate(-50%, calc(-100% - 15px))'
                  }}
                >
                  <div className="flex items-center space-x-2 mb-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredPoint.color }}></div>
                    <span className="text-white text-sm font-bold whitespace-nowrap">{hoveredPoint.productName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-4">{hoveredPoint.dateLabel}</div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-mono font-bold text-white leading-none tracking-tight">
                      {hoveredPoint.value}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">
                      units
                    </span>
                  </div>
                  
                  {/* Tooltip arrow */}
                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 italic">
              Insufficient transaction data to generate trend.
            </div>
          )}
        </div>
      </div>

      {/* Top Sellers Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700 bg-slate-950/30">
          <h3 className="text-white font-bold">Top 10 All-Time Sellers</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-700">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Rank</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Product Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Units Sold</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {topTenProducts.length > 0 ? (
              topTenProducts.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                      index === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' :
                      index === 2 ? 'bg-orange-700/20 text-orange-600 border border-orange-700/50' :
                      'bg-slate-900 text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-100 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{p.category}</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-400">{p.unitsSold}</td>
                  <td className="px-6 py-4 text-right text-green-400 font-mono">
                    {currency} {(p.unitsSold * p.price).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  No sales data available yet. Start selling products to see statistics.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BestSellers;
