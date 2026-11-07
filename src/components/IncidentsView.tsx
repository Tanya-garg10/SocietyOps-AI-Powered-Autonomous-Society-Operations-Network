import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertCircle, 
  Clock, 
  Building, 
  GitBranch, 
  User, 
  Wrench, 
  LayoutGrid, 
  List, 
  ChevronRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident } from '../types.js';

interface IncidentsViewProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onOpenCreateModal: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenCreateModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const filtered = incidents.filter((inc) => {
    if (selectedStatus !== 'All' && inc.status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    if (selectedPriority !== 'All' && inc.priority.toLowerCase() !== selectedPriority.toLowerCase()) {
      return false;
    }
    if (selectedBuilding !== 'All' && !inc.building.toLowerCase().includes(selectedBuilding.toLowerCase())) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.ticketNumber.toLowerCase().includes(q) ||
        inc.flat.toLowerCase().includes(q) ||
        inc.residentName.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statuses = ['All', 'Reported', 'Investigating', 'Awaiting Approval', 'Assigned', 'In Progress', 'Verification', 'Resolved'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const buildings = ['All', 'Block B', 'Block A', 'Block C', 'Clubhouse'];

  const priorityStyles: Record<string, string> = {
    Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    High: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  const statusStyles: Record<string, string> = {
    Reported: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    Investigating: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Awaiting Approval': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Assigned: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'In Progress': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Verification: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Incident Operations Desk</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
              {filtered.length} In Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous lifecycle tracking: Reported → Investigating → Awaiting Approval → Assigned → In Progress → Verification → Resolved
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-xl border border-white/[0.08] p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-900/40 transition flex items-center gap-2 active:scale-95 border border-white/10"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-md space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID, title, flat (e.g. B-204), resident..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 shrink-0 font-mono">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs rounded-xl border border-white/[0.08] px-3 py-2 bg-[#090d16] text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Building filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 shrink-0 font-mono">Block:</span>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="text-xs rounded-xl border border-white/[0.08] px-3 py-2 bg-[#090d16] text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {buildings.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/[0.06] no-scrollbar">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-indigo-900/40 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table / Cards */}
      {filtered.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#0c101a] border border-white/[0.08] text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No matching incidents in pipeline</h3>
          <p className="text-xs text-slate-500">Adjust search filters or report a new maintenance incident.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Modern Data Table */
        <div className="rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-md overflow-hidden">
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((inc) => (
              <motion.div
                key={inc.id}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => onSelectIncident(inc)}
                className="p-4 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      {inc.ticketNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${priorityStyles[inc.priority]}`}>
                      {inc.priority}
                    </span>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {inc.building} • {inc.flat} (Fl. {inc.floor})
                    </span>
                    {inc.correlationId && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        <GitBranch className="w-3 h-3 text-indigo-400" />
                        Correlated Shaft Risk
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white hover:text-blue-300 transition truncate">
                    {inc.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {inc.residentName}
                    </span>
                    {inc.assignedTechnician && (
                      <span className="flex items-center gap-1 text-blue-400 font-medium">
                        <Wrench className="w-3 h-3" />
                        {inc.assignedTechnician}
                      </span>
                    )}
                    <span className="font-mono text-slate-400">
                      Room: #{inc.switchRoom}
                    </span>
                  </div>
                </div>

                {/* Right side status & action */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-mono border ${statusStyles[inc.status] || 'bg-white/5'}`}>
                      {inc.status}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inc) => (
            <motion.div
              key={inc.id}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => onSelectIncident(inc)}
              className="p-5 rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-3 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {inc.ticketNumber}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${priorityStyles[inc.priority]}`}>
                    {inc.priority}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{inc.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{inc.description}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400">{inc.flat}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono border ${statusStyles[inc.status]}`}>
                  {inc.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
