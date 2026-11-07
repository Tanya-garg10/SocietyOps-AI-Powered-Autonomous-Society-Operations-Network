import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  Flame, 
  Layers, 
  X, 
  ArrowRight, 
  ShieldAlert, 
  Droplet, 
  Zap, 
  Wrench,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeatmapCell, Incident, IncidentCategory } from '../types.js';

interface RiskHeatmapViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const RiskHeatmapView: React.FC<RiskHeatmapViewProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [loading, setLoading] = useState(false);

  const categories: (string | 'All')[] = [
    'All',
    'Plumbing & Water',
    'Electrical & Power',
    'Elevators & Lifts',
    'Civil & Structural',
    'Security & Access',
    'Fire & Safety',
  ];

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const url = `/api/heatmap?category=${encodeURIComponent(selectedCategory)}&range=${selectedRange}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCells(data.data);
      }
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, [selectedCategory, selectedRange]);

  const buildings = ['Block A (Oak)', 'Block B (Maple)', 'Block C (Pine)', 'Clubhouse'];
  const floors = [6, 5, 4, 3, 2, 1, 0]; // 6 = Roof, 0 = Ground

  const getFloorLabel = (floor: number) => {
    if (floor === 6) return 'Roof / Terrace';
    if (floor === 0) return 'Ground / Lobby';
    return `Floor ${floor}`;
  };

  const getCellFor = (building: string, floor: number) => {
    return cells.find(c => c.building === building && c.floor === floor);
  };

  const getCellColorClass = (cell?: HeatmapCell) => {
    if (!cell || cell.incidentCount === 0) {
      return 'bg-[#0a0f1d]/60 border-white/[0.04] text-slate-600 hover:border-white/20';
    }
    switch (cell.riskLevel) {
      case 'critical':
        return 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:border-rose-400';
      case 'high':
        return 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:border-amber-400';
      case 'moderate':
        return 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:border-blue-400';
      default:
        return 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:border-emerald-400';
    }
  };

  const selectedCellIncidents = selectedCell
    ? incidents.filter(i => selectedCell.incidentIds.includes(i.id))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1222] via-[#10172c] to-[#0c1020] border border-amber-500/20 p-6 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Society Risk Heatmap
              </span>
              <span className="text-xs font-mono text-slate-400">Physical Topology & Incident Frequency</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Spatial Vulnerability & Recurring Problem Areas
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Cross-section matrix mapping live tickets across buildings and floors. Pinpoint recurring chronic defects before structural degradation occurs.
            </p>
          </div>

          {/* Quick Legend */}
          <div className="flex items-center gap-3 text-xs bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500/60" /> Low (0)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/40 border border-blue-500/60" /> Mod (1)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500/60" /> High (2)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/50 border border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Critical (3+)
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0a0f1d]/80 border border-white/[0.08]">
        {/* Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-semibold shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-semibold">Timeframe:</span>
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: 'all', label: 'All-Time' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRange(r.id)}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedRange === r.id
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main 8-Cols Matrix Grid */}
        <div className="lg:col-span-8 bg-[#0a0f1d]/90 rounded-2xl border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Multi-Block Spatial Matrix</span>
            </h3>
            {loading && (
              <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin" /> Recalculating density...
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Header row of Buildings */}
              <div className="grid grid-cols-5 gap-2 mb-2 text-xs font-bold font-mono text-slate-400 text-center">
                <div className="text-left text-slate-500">Floor Level</div>
                {buildings.map((b) => (
                  <div key={b} className="p-2 rounded-lg bg-white/[0.03] text-slate-300 truncate">
                    {b.split(' ')[0]} {b.split(' ')[1] || ''}
                  </div>
                ))}
              </div>

              {/* Floor Rows */}
              <div className="space-y-2">
                {floors.map((floor) => (
                  <div key={floor} className="grid grid-cols-5 gap-2 items-center">
                    {/* Floor Label */}
                    <div className="text-xs font-mono text-slate-400 truncate">
                      {getFloorLabel(floor)}
                    </div>

                    {/* 4 Building Cells */}
                    {buildings.map((building) => {
                      // Clubhouse only has floors 0 and 1
                      if (building === 'Clubhouse' && floor > 1) {
                        return (
                          <div
                            key={building}
                            className="h-14 rounded-xl border border-white/[0.02] bg-black/20 flex items-center justify-center text-[10px] text-slate-600 font-mono"
                          >
                            N/A
                          </div>
                        );
                      }

                      const cell = getCellFor(building, floor);
                      const isSelected = selectedCell?.building === building && selectedCell?.floor === floor;
                      const count = cell?.incidentCount || 0;

                      return (
                        <button
                          key={building}
                          onClick={() => setSelectedCell(cell || {
                            building,
                            floor,
                            incidentCount: 0,
                            criticalCount: 0,
                            riskLevel: 'low',
                            incidentIds: [],
                            dominantCategory: 'Plumbing & Water'
                          })}
                          className={`h-14 rounded-xl border p-2 transition-all flex flex-col justify-between text-left group relative ${getCellColorClass(cell)} ${
                            isSelected ? 'ring-2 ring-amber-400 shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold">
                              {count > 0 ? `${count} ${count === 1 ? 'incident' : 'incidents'}` : 'Clear'}
                            </span>
                            {cell && cell.criticalCount > 0 && (
                              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                            )}
                          </div>

                          <div className="text-[9px] truncate text-slate-400">
                            {count > 0 ? cell?.dominantCategory : 'Normal'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4-Cols Inspector Drawer */}
        <div className="lg:col-span-4 bg-[#0a0f1d]/90 rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Floor Zone Inspector
            </h3>
            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedCell ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{selectedCell.building}</span>
                  <span className="font-mono text-amber-400 font-bold uppercase">{selectedCell.riskLevel} Risk</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {getFloorLabel(selectedCell.floor)}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedCell.incidentCount} active or historical tickets recorded on this floor slab.
                </p>
              </div>

              {selectedCellIncidents.length > 0 ? (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {selectedCellIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="p-3 rounded-xl bg-[#0e1424] border border-white/[0.06] hover:border-amber-500/40 cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{inc.ticketNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300">
                          {inc.flat}
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                        {inc.title}
                      </h5>
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{inc.category}</span>
                        <span className="text-amber-400 flex items-center gap-1">
                          Inspect <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-300">No active incidents recorded</p>
                  <p className="text-[11px] text-slate-500 mt-1">This zone is operating within normal parameters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-slate-400">
              <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-300">Select any floor grid cell</p>
              <p className="text-[11px] text-slate-500 mt-1">Click a cell on the left to inspect localized tickets, recurring failures, and technician histories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
