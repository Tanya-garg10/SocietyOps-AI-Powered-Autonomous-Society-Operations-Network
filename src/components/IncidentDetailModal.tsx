import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Building, 
  User, 
  Phone, 
  GitBranch, 
  Wrench, 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  RotateCcw,
  MessageSquare,
  Bot,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident } from '../types.js';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
  onSubmitEvidenceClick: (incident: Incident) => void;
  onReopenIncident: (id: string, reason: string) => Promise<void>;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onNavigateToTab,
  onSubmitEvidenceClick,
  onReopenIncident,
}) => {
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const [showReopenInput, setShowReopenInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'hypothesis' | 'scope'>('timeline');

  if (!incident) return null;

  const handleReopen = async () => {
    if (!reopenReason.trim()) return;
    setIsReopening(true);
    try {
      await onReopenIncident(incident.id, reopenReason);
      setShowReopenInput(false);
      setReopenReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsReopening(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0b0f19] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col text-white"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-start justify-between bg-gradient-to-r from-slate-950 to-indigo-950/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-200 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded shadow-xs">
                {incident.ticketNumber}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${priorityStyles[incident.priority]}`}>
                {incident.priority} Priority
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${statusStyles[incident.status]}`}>
                {incident.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{incident.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <span className="text-slate-400 block mb-0.5 font-mono text-[10px]">Location</span>
              <span className="font-semibold text-white flex items-center gap-1.5 truncate">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                {incident.building} ({incident.flat})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-mono text-[10px]">Category</span>
              <span className="font-semibold text-white">{incident.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-mono text-[10px]">Resident</span>
              <span className="font-semibold text-white">{incident.residentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-mono text-[10px]">Assigned Tech</span>
              <span className="font-semibold text-blue-400 truncate block">
                {incident.assignedTechnician || 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Problem Description
            </h4>
            <p className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-300 leading-relaxed font-sans">
              {incident.description}
            </p>
          </div>

          {/* Root Cause Hypothesis Banner if Correlated */}
          {incident.rootCauseHypothesis && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  AI Root Cause Hypothesis (Spatial Correlation Detected)
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab('intelligence');
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                >
                  View Spatial Graph →
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {incident.rootCauseHypothesis}
              </p>
            </div>
          )}

          {/* Switch Room quick link */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/80 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">Collaborative Switch Room</span>
                <span className="block text-[11px] text-slate-400 font-mono">#{incident.switchRoom}</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToTab('switch');
              }}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
            >
              Open Stream →
            </button>
          </div>

          {/* Incident Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Autonomous Timeline & Audit Stream
            </h4>
            <div className="border-l-2 border-white/10 pl-4 space-y-4 ml-2">
              {incident.timeline.map((item) => {
                const isAgent = item.actorRole === 'agent';
                const isManager = item.actorRole === 'manager';
                return (
                  <div key={item.id} className="relative space-y-1">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-blue-500" />
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isAgent ? 'text-indigo-400' : isManager ? 'text-amber-400' : 'text-slate-200'}`}>
                        {item.actor}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-white">{item.action}</div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.details}</p>
                    {item.badge && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono mt-1">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reopen form */}
          {showReopenInput && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Reopen Incident for Physical Follow-up
              </h4>
              <textarea
                rows={2}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="State why resolution was inadequate or recurring..."
                className="w-full p-2.5 text-xs rounded-xl border border-rose-500/30 bg-black/50 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReopenInput(false)}
                  className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReopen}
                  disabled={isReopening || !reopenReason.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  Confirm Reopen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-slate-950 flex items-center justify-between">
          <div>
            {incident.status === 'Resolved' && !showReopenInput && (
              <button
                onClick={() => setShowReopenInput(true)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Incident</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSubmitEvidenceClick(incident)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Submit Proof of Work</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
