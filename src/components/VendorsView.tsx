import React, { useState } from 'react';
import { 
  Truck, 
  Star, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight,
  Filter,
  Sparkles,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vendor } from '../types.js';

interface VendorsViewProps {
  vendors: Vendor[];
  onNavigateToTab: (tab: any) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({ vendors, onNavigateToTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [comparing, setComparing] = useState(true);

  const filtered = vendors.filter((v) => {
    if (selectedCategory === 'All') return true;
    return v.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const categories = ['All', 'Plumbing', 'Electrical', 'Elevators', 'Civil'];

  const availabilityStyles: Record<string, string> = {
    Available: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'On Call': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Busy: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Offline: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Vetted Vendor Network</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
              Vendor Agent Benchmarked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-approved external contractors with verified commercial licenses, active liability insurance, and SLA track records.
          </p>
        </div>

        <button
          onClick={() => setComparing(!comparing)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 transition flex items-center gap-2 self-start"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{comparing ? 'Hide Quote Benchmark' : 'Compare Live Quotes'}</span>
        </button>
      </div>

      {/* Signature Live Quotation Comparison Widget */}
      <AnimatePresence>
        {comparing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-[#0c101a] via-[#0e1426] to-[#0c101a] border border-indigo-500/30 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Vendor Agent Live Benchmark: Block B Shaft Emergency Repair
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Optimal Vendor Selected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor 1: AquaFix (Recommended) */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-emerald-500/60 relative shadow-lg shadow-emerald-950/40">
                <div className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Recommended by Agent
                </div>
                <div className="text-sm font-bold text-white">AquaFix Plumbing Solutions</div>
                <div className="text-xs text-slate-300 mt-1">2-inch Schedule 80 PVC Riser Joint + Brass Valve</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono">$180</span>
                  <span className="text-xs text-slate-400">total estimate</span>
                  <span className="text-xs text-slate-300 ml-auto font-mono">ETA: 45 mins</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-300 font-sans">
                  ⭐ 4.8 Rating • 142 jobs completed • 6-Month Society Workmanship Warranty included.
                </p>
              </div>

              {/* Vendor 2: RapidPlumb */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/[0.08]">
                <div className="text-sm font-bold text-slate-300">RapidPlumb & Leak Detection</div>
                <div className="text-xs text-slate-400 mt-1">Emergency Callout + Riser Coupler Fitting</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-300 font-mono">$240</span>
                  <span className="text-xs text-slate-400">total estimate</span>
                  <span className="text-xs text-slate-300 ml-auto font-mono">ETA: 30 mins</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 font-sans">
                  ⭐ 4.9 Rating • 98 jobs completed • Higher emergency surcharge ($60 premium).
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-900/30 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] bg-[#0c101a] border border-white/[0.08]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vendor) => (
          <motion.div
            key={vendor.id}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-md p-5 space-y-4 hover:border-white/20 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{vendor.name}</h3>
                  <span className="text-xs text-blue-400 font-medium">{vendor.category}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${availabilityStyles[vendor.availability] || 'bg-white/5'}`}>
                  {vendor.availability}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.06] text-center text-xs">
                <div>
                  <div className="flex items-center justify-center gap-1 text-white font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{vendor.rating}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{vendor.totalJobs} jobs</div>
                </div>
                <div>
                  <div className="text-white font-bold font-mono">{vendor.slaMinutes}m</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Avg SLA</div>
                </div>
                <div>
                  <div className="text-white font-bold font-mono">${vendor.baseRate}/h</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Base Rate</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {vendor.badges.map((badge, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-slate-300">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Footer */}
            <div className="pt-3 border-t border-white/[0.06] text-xs space-y-1 text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <Phone className="w-3.5 h-3.5" />
                  {vendor.phone}
                </span>
                <span className="text-slate-500 text-[11px]">{vendor.contactPerson}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
