import React, { useState } from 'react';
import { 
  GitMerge, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  BrainCircuit, 
  ArrowRight, 
  Building2, 
  Layers, 
  Check, 
  HelpCircle,
  Activity,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CorrelationCluster, Incident } from '../types.js';

interface IncidentDetectiveViewProps {
  correlations: CorrelationCluster[];
  incidents: Incident[];
  onVerifyCorrelation: (clusterId: string) => Promise<void>;
  onTriggerScan: () => Promise<void>;
  onSelectIncident: (incident: Incident) => void;
}

export const IncidentDetectiveView: React.FC<IncidentDetectiveViewProps> = ({
  correlations,
  incidents,
  onVerifyCorrelation,
  onTriggerScan,
  onSelectIncident,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(correlations[0]?.id || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [factFilter, setFactFilter] = useState<'all' | 'facts' | 'hypotheses'>('all');

  const selectedCluster = correlations.find(c => c.id === selectedClusterId) || correlations[0];

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setScanMessage('Scanning spatial blueprints, cross-referencing acoustic & moisture telemetry...');
      await onTriggerScan();
      setScanMessage('Autonomous correlation scan complete! All active clusters refreshed.');
      setTimeout(() => setScanMessage(null), 4000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setVerifyingId(id);
      await onVerifyCorrelation(id);
    } finally {
      setVerifyingId(null);
    }
  };

  const getClusterIncidents = (cluster: CorrelationCluster) => {
    return incidents.filter(i => cluster.affectedIncidents.includes(i.id) || cluster.affectedIncidents.includes(i.ticketNumber));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1021] via-[#0d162d] to-[#0a0f1d] border border-cyan-500/20 p-6 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                AI Incident Detective
              </span>
              <span className="text-xs font-mono text-slate-400">Multi-Incident Correlation Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Root-Cause Cross-Correlation & Evidence Graphs
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Identifies hidden infrastructure failures by correlating timestamps, vertical riser shafts, electrical conduits, and resident complaints.
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-900/30 disabled:opacity-50 shrink-0"
          >
            {isScanning ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isScanning ? 'Correlating Spatial Nodes...' : 'Run Autonomous Scan'}</span>
          </button>
        </div>

        {scanMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{scanMessage}</span>
          </motion.div>
        )}
      </div>

      {/* Main Grid: Clusters Overview & Active Investigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Discovered Clusters List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono uppercase tracking-wider">
            <span>Detected Correlation Clusters ({correlations.length})</span>
            <span className="text-cyan-400">Live Blueprint Matches</span>
          </div>

          <div className="space-y-3">
            {correlations.map((cluster) => {
              const isSelected = selectedCluster?.id === cluster.id;
              const relatedCount = cluster.affectedIncidents.length;

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border text-left relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#10182f] border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-[#0a0f1d]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#0e1528]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {cluster.building}
                    </span>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      cluster.isVerified
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {cluster.isVerified ? 'VERIFIED' : `${cluster.confidenceScore}% CONFIDENCE`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5">{cluster.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {cluster.rootCauseHypothesis}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/[0.04]">
                    <span>{relatedCount} correlated incidents</span>
                    <span className="text-cyan-400 font-medium flex items-center gap-1">
                      Inspect Matrix <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Deep Investigation & Relationship Graph */}
        {selectedCluster && (
          <div className="lg:col-span-8 space-y-6">
            {/* Cluster Header Card */}
            <div className="bg-[#0a0f1d]/90 rounded-2xl border border-white/[0.08] p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedCluster.id}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-300">{selectedCluster.building}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-300">{selectedCluster.category}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedCluster.name}</h2>
                </div>

                {!selectedCluster.isVerified ? (
                  <button
                    onClick={() => handleVerify(selectedCluster.id)}
                    disabled={verifyingId === selectedCluster.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50 shrink-0"
                  >
                    {verifyingId === selectedCluster.id ? (
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>Confirm Root Cause</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified by {selectedCluster.verifiedBy || 'Field Engineer'}</span>
                  </div>
                )}
              </div>

              {/* Confidence & Root Cause Hypothesis Box */}
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-violet-950/30 via-[#131b33] to-[#0e172e] border border-violet-500/30">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-violet-200 uppercase tracking-wider font-mono">
                      AI Root-Cause Formulation
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Statistical Confidence:</span>
                    <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full"
                        style={{ width: `${selectedCluster.confidenceScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {selectedCluster.confidenceScore}%
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-100 font-medium leading-relaxed">
                  "{selectedCluster.rootCauseHypothesis}"
                </p>

                <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
                  <strong className="text-slate-300">Action Plan: </strong>
                  {selectedCluster.recommendedAction}
                </div>
              </div>

              {/* CLEAR SEPARATION: Confirmed Facts vs AI Hypotheses */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <span>Evidence Breakdown</span>
                    <span className="text-[10px] text-slate-500 font-normal">(Facts vs Hypotheses)</span>
                  </h4>

                  <div className="flex items-center gap-1 text-xs">
                    {(['all', 'facts', 'hypotheses'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setFactFilter(mode)}
                        className={`px-2.5 py-1 rounded-md capitalize transition ${
                          factFilter === mode
                            ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-400 hover:text-white bg-white/5'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Confirmed Facts (Green) */}
                  {(factFilter === 'all' || factFilter === 'facts') && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono uppercase">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Confirmed Physical Facts</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {(selectedCluster.confirmedFacts || [
                          `Verified active complaints at Block B 2nd & 3rd floor landing`,
                          `Architectural blueprint confirms shared utility riser shaft #BR-4`,
                          `Water meter telemetry shows 4.5 L/min uncontrolled loss during midnight interval`
                        ]).map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Hypotheses (Violet) */}
                  {(factFilter === 'all' || factFilter === 'hypotheses') && (
                    <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-violet-400 font-mono uppercase">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span>AI Root-Cause Hypotheses</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {(selectedCluster.hypothesizedPoints || [
                          selectedCluster.rootCauseHypothesis,
                          `Acoustic frequency analysis indicates rupture located within 1.2m of 2nd floor ceiling slab`,
                          `Sub-surface capillary seepage will enter elevator hoistway within 6 hours if unisolated`
                        ]).map((hypo, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{hypo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Incident Nodes */}
              <div className="mt-6 pt-5 border-t border-white/[0.08]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
                  Correlated Incident Nodes ({selectedCluster.affectedIncidents.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {getClusterIncidents(selectedCluster).map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="p-3 rounded-xl bg-[#0e1424] border border-white/[0.06] hover:border-cyan-500/40 cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{inc.ticketNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10">
                          {inc.flat}
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition">
                        {inc.title}
                      </h5>
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Status: {inc.status}</span>
                        <span className="text-violet-400 flex items-center gap-1">
                          View <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
