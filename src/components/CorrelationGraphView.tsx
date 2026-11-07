import React, { useState } from 'react';
import { 
  GitBranch, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Building, 
  Droplet, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CorrelationCluster, Incident } from '../types.js';

interface CorrelationGraphViewProps {
  correlations: CorrelationCluster[];
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onVerifyCorrelation: (id: string) => Promise<void>;
}

export const CorrelationGraphView: React.FC<CorrelationGraphViewProps> = ({
  correlations,
  incidents,
  onSelectIncident,
  onVerifyCorrelation,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<CorrelationCluster>(correlations[0]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const cluster = selectedCluster || correlations[0];

  const handleVerify = async () => {
    if (!cluster) return;
    setIsVerifying(true);
    try {
      await onVerifyCorrelation(cluster.id);
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#34d399'],
        });
      } catch (e) {
        // Fallback
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Spatial & Infrastructure Root-Cause Correlation
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
              Intelligence Agent Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Uncovers hidden structural and hydraulic failure conduits across isolated resident complaints. Strictly separates hypotheses from verified findings.
          </p>
        </div>

        {/* Verification Status Badge & Action */}
        <div className="flex items-center gap-3">
          {cluster?.isVerified ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Finding (Field Confirmed by {cluster.verifiedBy})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>AI Hypothesis (Unverified)</span>
              </span>
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-900/40 transition flex items-center gap-2 active:scale-95 disabled:opacity-50 border border-white/10"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Field Verification</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Operational Principle Constitution Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-slate-900 border border-blue-500/30 shadow-xl flex items-start gap-3.5 text-xs text-blue-200">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white font-semibold">SocietyOps Operational Principle #7: </strong>
          The Intelligence Agent generates architectural and hydraulic hypotheses from overlapping tickets, but humans must retain control. Never commit capital expenditures or demolish drywalls without field physical verification.
        </div>
      </div>

      {/* Interactive Visual Graph & Incident Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Visual Relationship Graph */}
        <div className="lg:col-span-2 bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>{cluster?.name}</span>
              </h3>
              <p className="text-xs text-slate-400">Vertical hydraulic flow schematic (Block B shaft alignment)</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-cyan-400 font-mono">
                {cluster?.confidenceScore}% Confidence
              </span>
              <div className="text-[10px] text-slate-500 font-mono">Bayesian spatial match</div>
            </div>
          </div>

          {/* SVG Visual Graph Representation */}
          <div className="relative p-6 rounded-2xl bg-[#06080e] border border-white/[0.08] overflow-hidden min-h-[400px] flex flex-col justify-between">
            {/* Background architectural grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

            {/* Central shared vertical riser pipe illustration */}
            <div className="absolute left-1/2 top-8 bottom-8 w-3 -translate-x-1/2 bg-blue-500/30 rounded-full border border-blue-400/60 shadow-[0_0_25px_rgba(56,189,248,0.4)] flex flex-col justify-around items-center">
              <span className="text-[9px] font-mono -rotate-90 text-blue-200 font-bold tracking-widest whitespace-nowrap">
                VERTICAL RISER COLUMN #BR-4 (SHARED CONDUIT)
              </span>
            </div>

            {/* Level 3: B-304 Floor Seepage */}
            <div className="relative z-10 flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.02 }}
                onMouseEnter={() => setActiveNode('B-304')}
                onMouseLeave={() => setActiveNode(null)}
                className={`w-64 p-3.5 rounded-xl border transition cursor-pointer backdrop-blur-md ${
                  activeNode === 'B-304'
                    ? 'bg-indigo-950/90 border-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/80 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                  <span>Flat B-304 (3rd Floor)</span>
                  <span className="text-[9px] bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-300">INC-102</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">Damp skirting & floor moisture near bathroom shaft</p>
                <div className="mt-2 text-[10px] font-mono text-slate-400">Elevation: +9.0m</div>
              </motion.div>

              <div className="w-28 text-right pr-4 font-mono text-[10px] text-cyan-400">
                Joint Rupture →
              </div>
            </div>

            {/* Level 2: B-204 Ceiling Leak (Primary focal incident) */}
            <div className="relative z-10 flex items-center justify-between my-6">
              <div className="w-28 pl-4 font-mono text-[10px] text-amber-400">
                ← Dripping Downward
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                onMouseEnter={() => setActiveNode('B-204')}
                onMouseLeave={() => setActiveNode(null)}
                className={`w-72 p-4 rounded-xl border shadow-xl backdrop-blur-md transition cursor-pointer ${
                  activeNode === 'B-204'
                    ? 'bg-amber-950/90 border-amber-400 shadow-amber-950/60 ring-2 ring-amber-400/40'
                    : 'bg-amber-950/70 border-amber-500/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                  <span>Flat B-204 (2nd Floor)</span>
                  <span className="text-[9px] bg-amber-900/90 text-amber-200 px-1.5 py-0.2 rounded font-mono font-bold">
                    PRIMARY INC-101
                  </span>
                </div>
                <p className="text-[11px] text-amber-100 mt-1 font-sans">
                  Active ceiling drip into kitchen directly beneath slab joint
                </p>
                <div className="mt-2 text-[10px] font-mono text-amber-300 font-semibold">
                  Elevation: +6.0m (Primary Leak Expression)
                </div>
              </motion.div>
            </div>

            {/* Level 0: Ground Floor Lift Lobby Accumulation */}
            <div className="relative z-10 flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.02 }}
                onMouseEnter={() => setActiveNode('Lobby')}
                onMouseLeave={() => setActiveNode(null)}
                className={`w-64 p-3.5 rounded-xl border transition cursor-pointer backdrop-blur-md ${
                  activeNode === 'Lobby'
                    ? 'bg-blue-950/90 border-blue-400 shadow-lg shadow-blue-950/50'
                    : 'bg-slate-900/80 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
                  <span>Ground Floor Lift Lobby</span>
                  <span className="text-[9px] bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-300">INC-103</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">Water pooling at base of structural column & pit</p>
                <div className="mt-2 text-[10px] font-mono text-slate-400">Elevation: 0.0m (Terminal Sump)</div>
              </motion.div>

              <div className="w-28 text-right pr-4 font-mono text-[10px] text-blue-400">
                Gravity Pooling ↓
              </div>
            </div>
          </div>

          {/* Prescriptive Recommendation */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Prescriptive Agent Recommendation
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {cluster?.recommendedAction}
            </p>
          </div>
        </div>

        {/* Right Col: Supporting Evidence & Correlated Tickets */}
        <div className="space-y-6">
          {/* Correlated Tickets */}
          <div className="bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-md p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Correlated Tickets ({cluster?.affectedIncidents.length})
            </h3>
            <div className="space-y-2">
              {incidents
                .filter((i) => i.building.includes('Block B'))
                .map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/20 transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-white">{inc.ticketNumber}</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold">{inc.flat}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
                      <span>Status: {inc.status}</span>
                      <span className="text-blue-400 font-semibold">Inspect →</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Mathematical Evidence Points */}
          <div className="bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-md p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Correlation Evidence Points
            </h3>
            <div className="space-y-2">
              {cluster?.evidencePoints.map((pt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-sans">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
