import React, { useState, useEffect } from 'react';
import { X, Camera, CheckCircle2, Wrench, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident } from '../types.js';

interface SubmitEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  preselectedIncident?: Incident | null;
  onSubmit: (data: {
    incidentId: string;
    technicianName: string;
    beforePhotoUrl: string;
    afterPhotoUrl: string;
    repairNotes: string;
    partsReplaced: string[];
    laborHours: number;
    checklist: Array<{ item: string; completed: boolean }>;
    residentFeedback?: string;
    residentRating?: number;
  }) => Promise<void>;
}

export const SubmitEvidenceModal: React.FC<SubmitEvidenceModalProps> = ({
  isOpen,
  onClose,
  incidents,
  preselectedIncident,
  onSubmit,
}) => {
  const [incidentId, setIncidentId] = useState(preselectedIncident?.id || incidents[0]?.id || '');
  const [technicianName, setTechnicianName] = useState('Rajesh Kumar (AquaFix Plumber)');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState(
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
  );
  const [repairNotes, setRepairNotes] = useState(
    'Isolated vertical riser valve BR-4. Replaced damaged 2-inch PVC coupler section inside Block B utility duct. Solvent welded new Schedule 80 brass union valve. Conducted hydrostatic pressure test at 4.2 bar for 20 minutes with zero pressure drop. Checked ceiling drywall in B-204.'
  );
  const [parts, setParts] = useState('2-inch Forged Brass Ball Valve, Schedule 80 Union Coupler, Solvent Cement, Neoprene Gasket');
  const [laborHours, setLaborHours] = useState('2.5');
  const [checklist, setChecklist] = useState([
    { item: 'Main utility valve isolated & tagged out', completed: true },
    { item: 'Damaged pipe/component removed cleanly', completed: true },
    { item: 'New OEM replacement part fitted & torqued', completed: true },
    { item: 'Hydrostatic pressure or continuity test passed (>4 bar)', completed: true },
    { item: 'Resident / Security physical verification signed off', completed: true },
  ]);
  const [residentFeedback, setResidentFeedback] = useState('Plumber arrived promptly and completely solved the leak! Very satisfied.');
  const [residentRating, setResidentRating] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedIncident) {
      setIncidentId(preselectedIncident.id);
    }
  }, [preselectedIncident]);

  if (!isOpen) return null;

  const toggleChecklist = (index: number) => {
    setChecklist((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId || !technicianName || !repairNotes) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        incidentId,
        technicianName,
        beforePhotoUrl,
        afterPhotoUrl,
        repairNotes,
        partsReplaced: parts.split(',').map((p) => p.trim()).filter(Boolean),
        laborHours: parseFloat(laborHours) || 2,
        checklist,
        residentFeedback,
        residentRating: parseInt(residentRating, 10) || 5,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0b0f19] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col text-white"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Field Resolution Proof Submission</h3>
              <p className="text-xs text-slate-400">Subject to automated verification audit by Verification Agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Target Incident & Technician */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Target Ticket *</label>
              <select
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {incidents.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.ticketNumber} — {i.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Lead Technician Name *</label>
              <input
                type="text"
                required
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Photo URLs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Before Photo URL (Defect)</label>
              <input
                type="url"
                required
                value={beforePhotoUrl}
                onChange={(e) => setBeforePhotoUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">After Photo URL (Resolved)</label>
              <input
                type="url"
                required
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Repair Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Technician Repair Notes *</label>
            <textarea
              required
              rows={3}
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Parts Replaced & Labor */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">Parts Replaced (comma separated)</label>
              <input
                type="text"
                value={parts}
                onChange={(e) => setParts(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Labor Hours</label>
              <input
                type="number"
                step="0.5"
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white font-mono"
              />
            </div>
          </div>

          {/* 5-Point Checklist */}
          <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <label className="font-mono font-bold text-slate-300 uppercase tracking-wider block text-[10px]">
              Field Completion Checklist (Audited by Verification Agent)
            </label>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklist(idx)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/20 focus:ring-indigo-500"
                  />
                  <span className={item.completed ? 'font-medium text-white' : 'text-slate-400'}>
                    {item.item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Resident Feedback */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">Resident Feedback</label>
              <input
                type="text"
                value={residentFeedback}
                onChange={(e) => setResidentFeedback(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Rating (1-5)</label>
              <select
                value={residentRating}
                onChange={(e) => setResidentRating(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-[#090d16] text-white"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-indigo-900/40 transition flex items-center gap-2 active:scale-95 disabled:opacity-50 border border-white/10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing with Verification Agent...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Proof for AI Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
