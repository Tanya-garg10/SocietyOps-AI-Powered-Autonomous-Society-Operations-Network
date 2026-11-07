import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Bot, 
  Layers, 
  Activity, 
  Building, 
  ArrowUpRight, 
  CheckCircle2, 
  GitBranch,
  ExternalLink,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Radio
} from 'lucide-react';
import { motion } from 'motion/react';
import { Incident, AgentInfo, ApprovalRequest, SwitchMessage } from '../types.js';
import { DemoWorkflowBanner } from './DemoWorkflowBanner.js';
import { NetworkConstellation } from './NetworkConstellation.js';

interface CommandCenterProps {
  incidents: Incident[];
  agents: AgentInfo[];
  approvals: ApprovalRequest[];
  switchMessages: SwitchMessage[];
  onSelectIncident: (inc: Incident) => void;
  onSelectAgent: (agent: AgentInfo) => void;
  onNavigateToTab: (tab: any) => void;
  onRunScenario: () => Promise<void>;
  onReset: () => Promise<void>;
  onOpenCreateModalWithPreset: (text: string, building: string, flat: string) => void;
  isSSEConnected: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  incidents,
  agents,
  approvals,
  switchMessages,
  onSelectIncident,
  onSelectAgent,
  onNavigateToTab,
  onRunScenario,
  onReset,
  onOpenCreateModalWithPreset,
  isSSEConnected,
}) => {
  const total = incidents.length;
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved').length;
  const critical = incidents.filter((i) => i.priority === 'Critical' && i.status !== 'Resolved').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length;
  const verifiedResolutions = incidents.filter((i) => i.status === 'Resolved').length;

  // Building distributions
  const buildingCounts = incidents.reduce<Record<string, { total: number; open: number }>>((acc, inc) => {
    const b = inc.building || 'Other';
    if (!acc[b]) acc[b] = { total: 0, open: 0 };
    acc[b].total += 1;
    if (inc.status !== 'Resolved') acc[b].open += 1;
    return acc;
  }, {});

  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentRoomMessages = [...switchMessages]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomous Multi-Agent Mission Control</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Your Society. <span className="text-gradient-cyan">Under Control.</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl font-normal leading-relaxed">
              Your AI operations team is monitoring, investigating and coordinating society operations in real-time over the Switch agent protocol.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToTab('war-room')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/40 transition flex items-center gap-2 border border-white/10"
            >
              <Radio className="w-4 h-4 text-violet-200 animate-pulse" />
              <span>Live Agent War Room</span>
            </button>
            <button
              onClick={() => onNavigateToTab('switch')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Switch Hub</span>
            </button>
          </div>
        </div>

        {/* Animated Network Visualization showing 6 agents & live incidents */}
        <NetworkConstellation
          agents={agents}
          incidents={incidents}
          onSelectAgent={onSelectAgent}
          onSelectIncident={onSelectIncident}
          isSSEConnected={isSSEConnected}
        />
      </div>

      {/* Signature Demo Banner */}
      <DemoWorkflowBanner
        onRunScenario={onRunScenario}
        onReset={onReset}
        onOpenCreateModalWithPreset={onOpenCreateModalWithPreset}
        onNavigateToTab={onNavigateToTab}
      />

      {/* 4 Metric Cards as requested in Section 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Incidents */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#0c101a] to-[#090d16] border border-white/[0.08] shadow-lg relative overflow-hidden group cursor-pointer"
          onClick={() => onNavigateToTab('incidents')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Active Incidents
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{activeIncidents}</div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-blue-400 font-semibold font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Real-time
            </span>
            <span className="text-slate-500">Autonomous triage active</span>
          </div>
        </motion.div>

        {/* Critical Alerts */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#0c101a] to-[#090d16] border border-rose-500/20 shadow-lg relative overflow-hidden group cursor-pointer"
          onClick={() => onNavigateToTab('incidents')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400">
              Critical Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{critical}</div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-rose-400 font-semibold font-mono">Safety Priority</span>
            <span className="text-slate-500">Immediate agent dispatch</span>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#0c101a] to-[#090d16] border border-amber-500/20 shadow-lg relative overflow-hidden group cursor-pointer"
          onClick={() => onNavigateToTab('approvals')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{pendingApprovals}</div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-amber-400 font-semibold font-mono">Manager Gate</span>
            <span className="text-slate-500">Sovereign human control</span>
          </div>
        </motion.div>

        {/* Verified Resolutions */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#0c101a] to-[#090d16] border border-emerald-500/20 shadow-lg relative overflow-hidden group cursor-pointer"
          onClick={() => onNavigateToTab('verification')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Verified Resolutions
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{verifiedResolutions}</div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-emerald-400 font-semibold font-mono">Proof Passed</span>
            <span className="text-slate-500">Audited with photos & tests</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Building Distribution & Recent Incident Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Infrastructure Density & Live Incidents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Building Infrastructure Distribution */}
          <div className="p-6 rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Building Infrastructure Incident Density
                </h3>
                <p className="text-xs text-slate-400">Real-time breakdown across residential blocks</p>
              </div>
              <button
                onClick={() => onNavigateToTab('intelligence')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
              >
                <span>Inspect Spatial Graph</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(buildingCounts).map(([buildingName, data]) => {
                const isBlockB = buildingName.includes('Block B');
                return (
                  <div
                    key={buildingName}
                    onClick={() => onNavigateToTab('incidents')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isBlockB
                        ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate">{buildingName}</span>
                      </div>
                      {isBlockB && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="Active Investigation" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-white">{data.open}</span>
                      <span className="text-xs text-slate-400">open</span>
                      <span className="text-[11px] text-slate-500 ml-auto font-mono">{data.total} total</span>
                    </div>
                    {isBlockB && (
                      <div className="mt-2 text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-mono font-medium">
                        Shaft BR-4 correlated
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Incident Stream */}
          <div className="rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-md overflow-hidden">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Live Incident Stream</h3>
                <p className="text-xs text-slate-400">Incoming tickets and multi-agent operations</p>
              </div>
              <button
                onClick={() => onNavigateToTab('incidents')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                View All Incidents →
              </button>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {recentIncidents.map((inc) => {
                const priorityStyles: Record<string, string> = {
                  Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                  High: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  Medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  Low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                };

                return (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="p-4 hover:bg-white/[0.02] transition cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {inc.ticketNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${priorityStyles[inc.priority]}`}>
                          {inc.priority}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          {inc.building} • {inc.flat}
                        </span>
                        {inc.correlationId && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                            <GitBranch className="w-2.5 h-2.5" />
                            Correlated
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate">{inc.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-white/5 border border-white/10 text-slate-300">
                        {inc.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Live Switch Stream & Agent Cards */}
        <div className="space-y-6">
          {/* Live Switch Stream */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-white/[0.08] shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">Switch Room Stream</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('switch')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Live Hub</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentRoomMessages.map((msg) => {
                const isAgent = msg.senderType === 'agent';
                const isHuman = msg.senderType === 'human';

                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isAgent ? 'text-indigo-400' : isHuman ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">{msg.content}</p>
                    <div className="text-[10px] font-mono text-slate-500">
                      Room: #{msg.roomId}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Teammates Fast Access */}
          <div className="p-5 rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">AI Teammates Roster</h3>
              <button
                onClick={() => onNavigateToTab('agents')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {agents.slice(0, 4).map((ag) => (
                <div
                  key={ag.id}
                  onClick={() => onSelectAgent(ag)}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/10 transition cursor-pointer flex items-center gap-3"
                >
                  <img
                    src={ag.avatar}
                    alt={ag.name}
                    className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{ag.name}</span>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase font-semibold">
                        {ag.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{ag.currentTask}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
