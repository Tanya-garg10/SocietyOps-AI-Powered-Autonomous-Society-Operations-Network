import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  Clock, 
  User, 
  Wrench, 
  Plus, 
  RotateCcw,
  Bot,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  KeyRound,
  FileCheck2,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResolutionEvidence, Incident } from '../types.js';

interface VerificationViewProps {
  evidenceList: ResolutionEvidence[];
  incidents: Incident[];
  onOpenSubmitEvidence: (incident?: Incident) => void;
  onReopenIncident: (incidentId: string, reason: string) => Promise<void>;
  onOverrideProof?: (evidenceId: string, reason: string) => Promise<void>;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  evidenceList,
  incidents,
  onOpenSubmitEvidence,
  onReopenIncident,
  onOverrideProof,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<ResolutionEvidence | null>(
    evidenceList[0] || null
  );
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);

  const breakdown = selectedEvidence?.proofBreakdown;
  const score = breakdown?.score ?? 92;
  const isEligible = breakdown?.isEligibleForClosure ?? true;
  const isOverridden = breakdown?.isOverridden ?? false;

  const handleConfirmOverride = async () => {
    if (!selectedEvidence || !overrideReason.trim()) return;
    try {
      setIsOverriding(true);
      if (onOverrideProof) {
        await onOverrideProof(selectedEvidence.id, overrideReason.trim());
      }
      setShowOverrideModal(false);
      setOverrideReason('');
    } finally {
      setIsOverriding(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Resolution Proof Score & Evidence</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono font-bold border border-violet-500/30">
              0-100% Evidence Gate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strict resolution verification: Automatically gates closure until technician reports, before/after photos, safety checklists, and resident ratings score ≥80%.
          </p>
        </div>

        <button
          onClick={() => onOpenSubmitEvidence()}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-900/40 transition flex items-center gap-2 self-start border border-white/10"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Field Resolution Proof</span>
        </button>
      </div>

      {/* Grid: Evidence Cards on Left, Comparison Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Evidence Records */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Resolution Audits ({evidenceList.length})
          </span>

          {evidenceList.map((evi) => {
            const isSelected = selectedEvidence?.id === evi.id;
            const itemScore = evi.proofBreakdown?.score ?? 90;
            const passed = (evi.proofBreakdown?.isEligibleForClosure ?? true) || evi.proofBreakdown?.isOverridden;

            return (
              <motion.div
                key={evi.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedEvidence(evi)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#0e1424] to-[#0a0e19] border-violet-500 shadow-xl shadow-violet-950/50 ring-1 ring-violet-500/30'
                    : 'bg-[#0c101a] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {evi.ticketNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      passed
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {itemScore}% PROOF
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={evi.beforePhotoUrl}
                    alt="Before"
                    className="w-16 h-12 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                  />
                  <div className="text-slate-500 text-xs">→</div>
                  <img
                    src={evi.afterPhotoUrl}
                    alt="After"
                    className="w-16 h-12 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                  />
                  <div className="ml-2 flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white block truncate">{evi.technicianName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{evi.laborHours}h labor • {evi.completedChecklist.length} checks</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right 2 Cols: Deep Dive Comparison Inspector */}
        {selectedEvidence ? (
          <div className="lg:col-span-2 bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-slate-950 to-indigo-950/70 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2.5 py-0.5 rounded">
                    {selectedEvidence.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-400">Technician: <strong className="text-white">{selectedEvidence.technicianName}</strong></span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">Proof of Work Quality Audit</h3>
              </div>

              {/* Resolution Proof Score Gauge Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Proof Score</span>
                  <span className={`text-xl font-extrabold font-mono ${
                    score >= 80 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {score} / 100
                  </span>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  isOverridden
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isEligible
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {isOverridden ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manager Overridden</span>
                    </>
                  ) : isEligible ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Closure Authorized</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Closure Gated</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Proof Score 5-Pillar Breakdown Card */}
            <div className="p-6 bg-gradient-to-r from-white/[0.02] to-transparent border-b border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-violet-400" />
                  <span>5-Pillar Evidence Weighting</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Target Threshold: ≥80%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Tech Report</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {breakdown?.technicianReportScore ?? 25} / 25
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Photos (B/A)</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {breakdown?.photoEvidenceScore ?? 25} / 25
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Checklist</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {breakdown?.checklistScore ?? 20} / 20
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Resident Signoff</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {breakdown?.residentSignoffScore ?? 15} / 15
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-mono block">Manager Audit</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {breakdown?.managerSignoffScore ?? 15} / 15
                  </span>
                </div>
              </div>

              {/* Missing Criteria Warning & Manager Override Trigger */}
              {(!isEligible && !isOverridden) && (
                <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Missing Mandatory Evidence for Closure:</span>
                    </div>
                    <ul className="text-xs text-rose-200/90 pl-6 list-disc space-y-0.5">
                      {(breakdown?.missingCriteria || ['Incomplete photo proof or safety checklist items']).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowOverrideModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-950/50 shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Manager Override</span>
                  </button>
                </div>
              )}

              {isOverridden && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-100">Quality Gate Overridden by {breakdown?.overrideBy || 'Operations Director'}: </strong>
                    "{breakdown?.overrideReason}"
                  </div>
                </div>
              )}
            </div>

            {/* Photos Side-by-Side */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto text-xs">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Visual Evidence (Before vs After)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span>BEFORE INCIDENT PHOTO</span>
                      <span className="text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded font-bold">Active Defect</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-white/[0.08] aspect-video bg-black/40">
                      <img
                        src={selectedEvidence.beforePhotoUrl}
                        alt="Before repair"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span>AFTER RESOLUTION PHOTO</span>
                      <span className="text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">Remediated</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-white/[0.08] aspect-video bg-black/40">
                      <img
                        src={selectedEvidence.afterPhotoUrl}
                        alt="After repair"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Technician Notes */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-400" />
                  Technician Work Report
                </h4>
                <p className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 leading-relaxed font-sans">
                  {selectedEvidence.repairNotes}
                </p>
              </div>

              {/* Checklist & Parts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Completed Field Checklist
                  </h4>
                  <div className="space-y-1.5">
                    {selectedEvidence.completedChecklist.map((c, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-300 font-medium">{c.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Parts & Materials Replaced
                  </h4>
                  <div className="space-y-1.5">
                    {selectedEvidence.partsReplaced.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 font-mono text-[11px]">
                        • {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification Agent Audit Notes */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Autonomous Verification Agent Audit Assessment</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {selectedEvidence.verificationAuditNotes}
                </p>
              </div>

              {/* Resident Feedback */}
              {selectedEvidence.residentFeedback && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Resident Feedback & Sign-off</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(selectedEvidence.residentRating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 italic font-sans">"{selectedEvidence.residentFeedback}"</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-16 bg-[#0c101a] rounded-2xl border border-white/[0.08] text-center text-slate-500 text-xs">
            Select a resolution record to inspect verification proofs.
          </div>
        )}
      </div>

      {/* Manager Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0e1424] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-base text-white">Manager Resolution Proof Override</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              You are authorizing closure for <strong className="text-white">{selectedEvidence?.ticketNumber}</strong> despite incomplete evidence metrics (Score: {score}%). This action will be published to Switch and immortalized in the audit log.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mandatory Override Justification Reason
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Resident verbally confirmed water supply restored; physical photo inspection completed by Society Secretary on site..."
                rows={3}
                className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOverride}
                disabled={isOverriding || !overrideReason.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition disabled:opacity-50"
              >
                {isOverriding ? 'Recording Override...' : 'Confirm Override & Close Ticket'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
