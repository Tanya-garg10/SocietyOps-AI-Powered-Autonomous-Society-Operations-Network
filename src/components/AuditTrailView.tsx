import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Bot, 
  User, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Filter,
  CheckCircle2,
  GitBranch,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { AuditEvent } from '../types.js';

interface AuditTrailViewProps {
  auditLog: AuditEvent[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLog }) => {
  const [search, setSearch] = useState('');
  const [selectedActorType, setSelectedActorType] = useState<string>('All');

  const filtered = auditLog.filter((item) => {
    if (selectedActorType !== 'All' && item.actorType.toLowerCase() !== selectedActorType.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.action.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        (item.incidentId && item.incidentId.toLowerCase().includes(q)) ||
        item.traceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `societyops-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const actorTypeStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    agent: { bg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300', text: 'Autonomous Agent', icon: Bot },
    human: { bg: 'bg-blue-500/20 border-blue-500/30 text-blue-300', text: 'Human Operations', icon: User },
    technician: { bg: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300', text: 'Field Technician', icon: Wrench },
    vendor: { bg: 'bg-purple-500/20 border-purple-500/30 text-purple-300', text: 'Contractor Vendor', icon: ShieldCheck },
    system: { bg: 'bg-white/5 border-white/10 text-slate-300', text: 'Switch Hub Bus', icon: FileText },
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Immutable Operations Audit Trail</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              Cryptographically Traced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Append-only event journal tracking every decision made by residents, AI agents, operations managers, and external vendors.
          </p>
        </div>

        <button
          onClick={exportJson}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 transition flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>Export JSON Audit Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-md flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by action, actor, ticket ID, trace ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 shrink-0 font-mono">Actor:</span>
          <select
            value={selectedActorType}
            onChange={(e) => setSelectedActorType(e.target.value)}
            className="text-xs rounded-xl border border-white/[0.08] px-3 py-2 bg-[#090d16] text-slate-300"
          >
            <option value="All">All Actors</option>
            <option value="agent">Autonomous Agents</option>
            <option value="human">Human Operations</option>
            <option value="technician">Technicians</option>
            <option value="vendor">Vendors</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-md overflow-hidden">
        <div className="divide-y divide-white/[0.06]">
          {filtered.map((item) => {
            const config = actorTypeStyles[item.actorType] || actorTypeStyles.system;
            const Icon = config.icon;

            return (
              <div key={item.id} className="p-4 hover:bg-white/[0.02] transition flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${config.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white tracking-tight">{item.action}</span>
                    <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${config.bg}`}>
                      {item.actor} ({config.text})
                    </span>
                    {item.incidentId && (
                      <span className="font-mono text-[10px] text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                        {item.incidentId}
                      </span>
                    )}
                    {item.switchRoom && (
                      <span className="font-mono text-[10px] text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/30">
                        #{item.switchRoom}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans">{item.details}</p>

                  <div className="flex items-center gap-4 pt-1 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span>Trace ID: {item.traceId}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
