import React, { useState, useEffect } from 'react';
import { X, Sparkles, Building2, Send, Loader2, Bot, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    building?: string;
    flat?: string;
    residentName?: string;
    residentContact?: string;
  }) => Promise<void>;
  initialPreset?: {
    description: string;
    building: string;
    flat: string;
  };
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPreset,
}) => {
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('Block B (Maple)');
  const [flat, setFlat] = useState('B-204');
  const [residentName, setResidentName] = useState('Priya Sharma');
  const [residentContact, setResidentContact] = useState('+91 98200 11234');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialPreset) {
      setDescription(initialPreset.description);
      setBuilding(initialPreset.building);
      setFlat(initialPreset.flat);
    }
  }, [initialPreset]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        description,
        building,
        flat,
        residentName,
        residentContact,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (presetText: string, bld: string, flt: string, resName: string) => {
    setDescription(presetText);
    setBuilding(bld);
    setFlat(flt);
    setResidentName(resName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0b0f19] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-white"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Report Incident to Operations Network</h3>
              <p className="text-xs text-slate-400">Autonomous Triage Agent will parse & announce via Switch protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Hackathon Demo Presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Water is leaking from the ceiling in Block B, Flat 204. It has been happening actively since morning and dripping onto kitchen counters.',
                    'Block B (Maple)',
                    'B-204',
                    'Priya Sharma'
                  )
                }
                className="text-[11px] px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium transition"
              >
                🌊 B-204 Water Leak (Signature Demo)
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Elevator #2 in Block A is leveling unevenly, stopping 2 inches above the landing on the 5th floor.',
                    'Block A (Oak)',
                    'Elevator #2',
                    'Kavita Nair'
                  )
                }
                className="text-[11px] px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-medium transition"
              >
                🛗 Lift #2 Leveling Fault
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Solar water circulation pump pressure dropped to 0.8 bar on Block C roof array.',
                    'Block C (Pine)',
                    'Roof Pump C-1',
                    'Security Guard Ramesh'
                  )
                }
                className="text-[11px] px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-medium transition"
              >
                ☀️ Solar Pump Pressure
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center justify-between">
              <span>Incident Description & Symptoms *</span>
              <span className="text-[10px] text-cyan-400 font-mono">Parsed by Triage Agent (Gemini AI)</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, exact location, and urgency indicators..."
              className="w-full p-3.5 text-xs rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
            />
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Building / Block</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Block B (Maple)">Block B (Maple)</option>
                <option value="Block A (Oak)">Block A (Oak)</option>
                <option value="Block C (Pine)">Block C (Pine)</option>
                <option value="Clubhouse">Clubhouse</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Flat or Unit #</label>
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. B-204"
                className="w-full p-2.5 text-xs rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Resident Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Resident / Reporter Name</label>
              <input
                type="text"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full p-2.5 text-xs rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Contact Number</label>
              <input
                type="text"
                value={residentContact}
                onChange={(e) => setResidentContact(e.target.value)}
                placeholder="e.g. +91 98200 11234"
                className="w-full p-2.5 text-xs rounded-xl border border-white/[0.08] bg-[#090d16] text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* AI Info Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-200">
            <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">
              <strong>Triage Agent</strong> will immediately classify severity and announce in <strong>#society-control</strong>, while <strong>Intelligence Agent</strong> calculates multi-flat spatial correlation.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-900/40 transition flex items-center gap-2 active:scale-95 disabled:opacity-50 border border-white/10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Classifying with AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Autonomous Ops</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
