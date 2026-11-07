import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  X, 
  DollarSign, 
  Clock, 
  User, 
  Bot, 
  CheckCircle2,
  FileText,
  Sparkles,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ApprovalRequest } from '../types.js';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRequestChanges?: (id: string, notes: string) => Promise<void>;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(
    approvals.find((a) => a.status === 'pending') || approvals[0] || null
  );
  const [decisionNotes, setDecisionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesNotes, setChangesNotes] = useState('');
  const [actionModal, setActionModal] = useState<'none' | 'reject' | 'changes'>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const pastList = approvals.filter((a) => a.status !== 'pending');

  const handleApprove = async () => {
    if (!selectedApproval) return;
    setIsProcessing(true);
    try {
      await onApprove(selectedApproval.id, decisionNotes);
      setDecisionNotes('');
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
      } catch (e) {
        // Fallback
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(selectedApproval.id, rejectionReason);
      setRejectionReason('');
      setActionModal('none');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedApproval || !changesNotes.trim()) return;
    setIsProcessing(true);
    try {
      if (onRequestChanges) {
        await onRequestChanges(selectedApproval.id, changesNotes);
      }
      setChangesNotes('');
      setActionModal('none');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Smart Approval Center</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
              {pendingList.length} Pending Authorization
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive gate for workforce dispatch, vendor selection, budget expenditures, and critical closure. Outgoing decisions synchronize directly with Switch rooms and immutable audit ledgers.
          </p>
        </div>
      </div>

      {/* Main Grid: Approvals List & Selected Approval Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Pending & Past items */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Pending Queue ({pendingList.length})
          </div>

          {pendingList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0c101a] border border-white/[0.08] text-center text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <span>All agent approval requests have been decided.</span>
            </div>
          ) : (
            pendingList.map((app) => (
              <motion.div
                key={app.id}
                whileHover={{ y: -2 }}
                onClick={() => {
                  setSelectedApproval(app);
                  setActionModal('none');
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedApproval?.id === app.id
                    ? 'bg-gradient-to-br from-[#0e1424] to-[#0a0e19] border-indigo-500 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                    : 'bg-[#0c101a] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {app.ticketNumber}
                  </span>
                  <span className="text-sm font-extrabold text-amber-400 font-mono">
                    ${app.estimatedCost}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2 line-clamp-1">{app.title}</h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                    <Bot className="w-3.5 h-3.5" />
                    {app.requestedByAgent}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-500 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {new Date(app.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))
          )}

          {/* Past Decisions */}
          {pastList.length > 0 && (
            <div className="pt-4 space-y-2.5">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Audit History ({pastList.length})
              </div>
              {pastList.map((app) => {
                const isApproved = app.status === 'approved';
                const isChanges = app.status === 'changes_requested';

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApproval(app);
                      setActionModal('none');
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                      selectedApproval?.id === app.id
                        ? 'bg-white/[0.05] border-white/20'
                        : 'bg-[#090d16] border-white/[0.06] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-400">{app.ticketNumber}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isChanges
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {isChanges ? 'Changes Requested' : app.status}
                      </span>
                    </div>
                    <div className="text-slate-300 font-medium truncate mt-1">{app.title}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Cols: Selected Approval Package */}
        {selectedApproval ? (
          <div className="lg:col-span-2 bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-slate-950 to-indigo-950/70">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2.5 py-0.5 rounded">
                    {selectedApproval.ticketNumber}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedApproval.actionType.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-amber-400 font-mono">${selectedApproval.estimatedCost}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">ESTIMATED DISPATCH COST</span>
                </div>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{selectedApproval.title}</h3>
            </div>

            {/* Package Details */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto text-xs">
              {/* Agent Rationale */}
              <div className="space-y-1.5">
                <span className="font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  Agent Justification & Root Cause Context
                </span>
                <p className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 leading-relaxed font-sans">
                  {selectedApproval.reason}
                </p>
              </div>

              {/* Scope of Work */}
              <div className="space-y-1.5">
                <span className="font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Technical Scope of Work
                </span>
                <p className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 leading-relaxed font-sans">
                  {selectedApproval.supportingData.scopeOfWork}
                </p>
              </div>

              {/* Risk Assessment */}
              {selectedApproval.supportingData.riskAssessment && (
                <div className="space-y-1.5">
                  <span className="font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Risk Assessment (Cost of Inaction)
                  </span>
                  <p className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 leading-relaxed font-sans">
                    {selectedApproval.supportingData.riskAssessment}
                  </p>
                </div>
              )}

              {/* Alternatives Considered */}
              {selectedApproval.supportingData.alternativesConsidered && (
                <div className="space-y-2">
                  <span className="font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Alternatives Benchmarked by Agent
                  </span>
                  <ul className="space-y-1.5">
                    {selectedApproval.supportingData.alternativesConsidered.map((alt, idx) => (
                      <li key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-300 flex items-start gap-2">
                        <span className="text-slate-500">•</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status if already decided */}
              {selectedApproval.status !== 'pending' && (
                <div className={`p-4 rounded-xl border ${
                  selectedApproval.status === 'approved'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : selectedApproval.status === 'changes_requested'
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="font-mono font-bold uppercase text-[10px]">
                    Outcome Logged: {selectedApproval.status.replace('_', ' ')}
                  </div>
                  <div className="text-xs mt-1">Authorized by: <strong>{selectedApproval.decidedBy || 'Operations Lead'}</strong></div>
                  {selectedApproval.decisionNotes && (
                    <div className="text-xs mt-1 font-sans">Notes: {selectedApproval.decisionNotes}</div>
                  )}
                  {selectedApproval.changesRequestedNotes && (
                    <div className="text-xs mt-1 font-sans text-amber-300">
                      Modifications Requested: {selectedApproval.changesRequestedNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Manager Decision Form if Pending */}
              {selectedApproval.status === 'pending' && (
                <div className="pt-4 border-t border-white/[0.08] space-y-4">
                  {actionModal === 'none' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Manager Authorization Notes (Optional)</label>
                        <input
                          type="text"
                          value={decisionNotes}
                          onChange={(e) => setDecisionNotes(e.target.value)}
                          placeholder="e.g. Approved immediately for emergency shaft isolation."
                          className="w-full p-2.5 text-xs rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                        {/* Request Changes Button */}
                        <button
                          type="button"
                          onClick={() => setActionModal('changes')}
                          className="px-3.5 py-2.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Changes</span>
                        </button>

                        {/* Reject Button */}
                        <button
                          type="button"
                          onClick={() => setActionModal('reject')}
                          className="px-3.5 py-2.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        {/* Approve Button */}
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 active:scale-95 disabled:opacity-50 border border-white/10"
                        >
                          <Check className="w-4 h-4" />
                          <span>Authorize & Dispatch (${selectedApproval.estimatedCost})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reject Reason Box */}
                  {actionModal === 'reject' && (
                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-3">
                      <label className="text-xs font-bold text-rose-300">
                        Mandatory Rejection Feedback for Agent Network:
                      </label>
                      <textarea
                        rows={2}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why quotation or scope is rejected (e.g. quote too high, seek alternative contractor)..."
                        className="w-full p-2.5 text-xs rounded-xl border border-rose-500/40 bg-black/50 text-white placeholder-slate-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActionModal('none')}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isProcessing || !rejectionReason.trim()}
                          className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-500 disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Request Changes Box */}
                  {actionModal === 'changes' && (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-3">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        <span>Specify Requested Adjustments for Agent Teammates:</span>
                      </label>
                      <textarea
                        rows={3}
                        value={changesNotes}
                        onChange={(e) => setChangesNotes(e.target.value)}
                        placeholder="e.g. Please negotiate 15% discount on brass fittings with AquaFix, or verify if warranty covers riser coupler..."
                        className="w-full p-2.5 text-xs rounded-xl border border-amber-500/40 bg-black/50 text-white placeholder-slate-500"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActionModal('none')}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestChanges}
                          disabled={isProcessing || !changesNotes.trim()}
                          className="px-4 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-500 disabled:opacity-50"
                        >
                          Submit Revision Request
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-16 bg-[#0c101a] rounded-2xl border border-white/[0.08] text-center text-slate-500 text-xs">
            Select an approval request to view supporting data.
          </div>
        )}
      </div>
    </div>
  );
};
