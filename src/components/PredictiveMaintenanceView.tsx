import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Wrench, 
  Activity, 
  Clock, 
  ShieldAlert,
  ChevronRight,
  Flame,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PredictiveRecommendation, Incident } from '../types.js';

interface PredictiveMaintenanceViewProps {
  onSelectIncident: (incident: Incident) => void;
  onWorkOrderCreated?: () => void;
}

export const PredictiveMaintenanceView: React.FC<PredictiveMaintenanceViewProps> = ({
  onSelectIncident,
  onWorkOrderCreated,
}) => {
  const [recommendations, setRecommendations] = useState<PredictiveRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/predictive');
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (err) {
      console.error('Failed to load predictive recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleConvert = async (rec: PredictiveRecommendation) => {
    try {
      setConvertingId(rec.id);
      const res = await fetch(`/api/predictive/${rec.id}/convert`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSuccessBanner(`Proactive work order ${data.data?.ticketNumber || 'created'} dispatched for ${rec.assetName}!`);
        await fetchRecommendations();
        if (onWorkOrderCreated) onWorkOrderCreated();
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (err) {
      console.error('Failed to convert recommendation to work order:', err);
    } finally {
      setConvertingId(null);
    }
  };

  const totalAvoidanceSavings = recommendations.reduce(
    (sum, r) => sum + (r.estimatedCatastrophicCost - r.estimatedPreventiveCost),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1222] via-[#10172e] to-[#0c1020] border border-emerald-500/20 p-6 shadow-2xl">
        <div className="absolute top-0 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Predictive Maintenance Intelligence
              </span>
              <span className="text-xs font-mono text-slate-400">Statistical Risk & Cost Avoidance</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Preemptive Defect Forecasting & Intervention
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Correlates recurring ticket history, asset service lives, and building blueprints to recommend proactive repairs before catastrophic outages.
            </p>
          </div>

          {/* Cumulative Avoidance Savings Metric */}
          <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 backdrop-blur-md flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                Potential Avoidance Savings
              </span>
              <span className="text-xl font-extrabold text-emerald-300 font-mono">
                ${totalAvoidanceSavings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Ethical Non-Alarmist Guarantee Banner */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Probabilistic Guarantee: </strong>
            Predictive intelligence models statistical vulnerability from frequency and operational age. Forecasts are recommendations and are never presented as confirmed structural failures without on-site field verification.
          </p>
        </div>

        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </motion.div>
        )}
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono uppercase tracking-wider">
          <span>Active Asset Risk Assessments ({recommendations.length})</span>
          <span className="text-emerald-400">Memory Agent Knowledge Graph</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((rec) => {
            const isCritical = rec.priority === 'Critical';
            const isScheduled = rec.status === 'scheduled';
            const netSavings = rec.estimatedCatastrophicCost - rec.estimatedPreventiveCost;

            return (
              <div
                key={rec.id}
                className={`p-6 rounded-2xl bg-[#0a0f1d]/90 border transition-all shadow-xl relative overflow-hidden ${
                  isScheduled
                    ? 'border-emerald-500/40 bg-[#0c1424]'
                    : isCritical
                    ? 'border-rose-500/40 hover:border-rose-500/60'
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-emerald-400">{rec.id}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-300">{rec.building}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-300">{rec.category}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-mono text-slate-400">{rec.incidentFrequency}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {rec.assetName}
                      {isCritical && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          Critical Priority
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Failure Probability Gauge */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Statistical Risk</span>
                      <span className={`text-base font-extrabold font-mono ${
                        rec.failureProbability >= 80 ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {rec.failureProbability}% Probability
                      </span>
                    </div>

                    <div className="w-16 h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rec.failureProbability >= 80
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${rec.failureProbability}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Body: Chronic Defect & Preventive Prescription */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Identified Chronic Defect
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rec.chronicDefectReason}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">
                      Recommended Preventive Action
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rec.preventiveAction}
                    </p>
                  </div>
                </div>

                {/* Footer: Financial Avoidance Comparison & Dispatch Button */}
                <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">PREVENTIVE COST</span>
                      <span className="text-emerald-300 font-bold">${rec.estimatedPreventiveCost}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CATASTROPHIC OUTAGE</span>
                      <span className="text-rose-400 font-bold">${rec.estimatedCatastrophicCost}</span>
                    </div>
                    <div className="pl-3 border-l border-white/10">
                      <span className="text-slate-500 block text-[10px]">NET AVOIDANCE SAVINGS</span>
                      <span className="text-emerald-400 font-extrabold">+${netSavings}</span>
                    </div>
                  </div>

                  {isScheduled ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Work Order Scheduled</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConvert(rec)}
                      disabled={convertingId === rec.id}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50 shrink-0"
                    >
                      {convertingId === rec.id ? (
                        <Activity className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wrench className="w-3.5 h-3.5" />
                      )}
                      <span>Convert into Proactive Work Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
