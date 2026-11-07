import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, CheckCircle2, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface DemoWorkflowBannerProps {
  onRunScenario: () => Promise<void>;
  onReset: () => Promise<void>;
  onOpenCreateModalWithPreset: (presetText: string, building: string, flat: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DemoWorkflowBanner: React.FC<DemoWorkflowBannerProps> = ({
  onRunScenario,
  onReset,
  onOpenCreateModalWithPreset,
  onNavigateToTab,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastRunSteps, setLastRunSteps] = useState<string[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      await onRunScenario();
      setLastRunSteps([
        '1. Resident reported ceiling leak in B-204',
        '2. Triage Agent classified priority HIGH & announced in #society-control',
        '3. Intelligence Agent detected Block B shaft correlation (B-204 + B-304 + Lobby)',
        '4. Dispatch Agent & Vendor Agent formulated $180 work order recommendation',
        '5. Manager approved emergency valve dispatch in Approval Gate',
        '6. Plumber Rajesh completed repair & uploaded before/after photos + pressure test',
        '7. Verification Agent audited proof and marked incident RESOLVED',
      ]);
      setShowSteps(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#38bdf8', '#818cf8', '#c084fc', '#34d399'],
        });
      } catch (e) {
        // Fallback
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
      setLastRunSteps([]);
      setShowSteps(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1322] via-[#101830] to-[#0c101d] border border-indigo-500/30 p-6 text-white shadow-2xl">
      {/* Background ambient blur lights */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Signature Hackathon Scenario
            </span>
            <span className="text-xs text-slate-400 font-mono">Switch Multi-Agent Network in Action</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Block B Vertical Water Leak Escalation
          </h2>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-sans font-normal">
            Experience the complete autonomous resolution loop: from resident complaint to AI Triage, Intelligence correlation, Switch agent debate, human financial approval, and proof of resolution verification.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() =>
              onOpenCreateModalWithPreset(
                'Water is leaking from the ceiling in Block B, Flat 204. It has been happening since morning and dripping onto kitchen counters.',
                'Block B (Maple)',
                'B-204'
              )
            }
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1.5"
          >
            <span>Manual Step-by-Step</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-950/60 transition flex items-center gap-2 active:scale-95 disabled:opacity-70 border border-white/20"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Multi-Agent Loop...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>1-Click Autonomous Demo</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset data to initial state"
            className="p-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Demo steps disclosure */}
      <AnimatePresence>
        {showSteps && lastRunSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 pt-4 border-t border-white/[0.08] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Autonomous Multi-Agent Loop Completed Successfully!
              </span>
              <button
                onClick={() => onNavigateToTab('switch')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-mono"
              >
                <span>Inspect Switch Room Events</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px] text-slate-300">
              {lastRunSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5 font-sans"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
                    ✓
                  </span>
                  <span className="leading-snug">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
