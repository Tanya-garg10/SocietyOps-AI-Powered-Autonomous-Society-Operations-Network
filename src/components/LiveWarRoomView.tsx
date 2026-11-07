import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  ArrowRight, 
  Clock, 
  Terminal, 
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Network,
  Cpu,
  Search,
  Wrench,
  Camera,
  Maximize2,
  Filter,
  MessageSquare,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentInfo, AgentWarRoomEvent, Incident, SwitchRoom, SwitchMessage } from '../types.js';
import { SwitchHubDiagram } from './SwitchHubDiagram.js';

interface LiveWarRoomViewProps {
  agents: AgentInfo[];
  warRoomEvents: AgentWarRoomEvent[];
  incidents: Incident[];
  isSSEConnected: boolean;
  switchRooms?: SwitchRoom[];
  switchMessages?: SwitchMessage[];
  onSelectAgent: (agent: AgentInfo) => void;
  onSelectIncident: (incident: Incident) => void;
  onDispatchDirective: (agentId: string, directive: string, targetIncidentId?: string) => Promise<void>;
}

export const LiveWarRoomView: React.FC<LiveWarRoomViewProps> = ({
  agents,
  warRoomEvents,
  incidents,
  isSSEConnected,
  switchRooms = [],
  switchMessages = [],
  onSelectAgent,
  onSelectIncident,
  onDispatchDirective,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-triage');
  const [hoveredAgent, setHoveredAgent] = useState<AgentInfo | null>(null);
  const [directiveText, setDirectiveText] = useState('');
  const [targetIncidentId, setTargetIncidentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'integrated' | 'diagram' | 'timeline'>('integrated');

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleSendDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveText.trim()) return;

    try {
      setIsSubmitting(true);
      await onDispatchDirective(selectedAgentId, directiveText.trim(), targetIncidentId || undefined);
      setDirectiveText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = warRoomEvents.filter(ev => {
    if (filterType === 'all') return true;
    if (filterType === 'handoff') return ev.eventType === 'handoff' || ev.eventType === 'triage_dispatch';
    if (filterType === 'decision') return ev.eventType === 'decision' || ev.eventType === 'human_escalation';
    if (filterType === 'correlation') return ev.eventType === 'correlation_alert';
    if (filterType === 'audit') return ev.eventType === 'evidence_audit' || ev.eventType === 'quote_benchmark';
    return true;
  });

  const getEventBadge = (type: AgentWarRoomEvent['eventType']) => {
    switch (type) {
      case 'triage_dispatch':
        return { label: 'Triage Handoff', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'correlation_alert':
        return { label: 'Correlation Alert', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' };
      case 'quote_benchmark':
        return { label: 'Quote Benchmark', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'evidence_audit':
        return { label: 'Evidence Audit', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'human_escalation':
        return { label: 'Human Directive', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'decision':
        return { label: 'Consensus Decision', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      default:
        return { label: 'Agent Handoff', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    }
  };

  // Node coordinates for 6 agents around the central Switch Hub (SVG 600 x 380)
  const agentPositions: Record<string, { x: number; y: number; color: string; ringColor: string; label: string; icon: React.ElementType }> = {
    'agent-triage': { x: 300, y: 55, color: '#38bdf8', ringColor: 'rgba(56, 189, 248, 0.4)', label: 'Triage', icon: ShieldCheck },
    'agent-intel': { x: 490, y: 120, color: '#818cf8', ringColor: 'rgba(129, 140, 248, 0.4)', label: 'Intelligence', icon: Search },
    'agent-dispatch': { x: 490, y: 260, color: '#60a5fa', ringColor: 'rgba(96, 165, 250, 0.4)', label: 'Dispatch', icon: Wrench },
    'agent-memory': { x: 300, y: 325, color: '#c084fc', ringColor: 'rgba(192, 132, 252, 0.4)', label: 'Memory', icon: Cpu },
    'agent-vendor': { x: 110, y: 260, color: '#f59e0b', ringColor: 'rgba(245, 158, 11, 0.4)', label: 'Vendor', icon: Layers },
    'agent-verify': { x: 110, y: 120, color: '#10b981', ringColor: 'rgba(16, 185, 129, 0.4)', label: 'Verification', icon: Camera },
  };

  // Active collaboration handoff links from recent events
  const activeLinks = [
    { from: 'agent-triage', to: 'agent-intel', label: 'Triage Dispatched' },
    { from: 'agent-intel', to: 'agent-dispatch', label: 'Spatial Correlation' },
    { from: 'agent-dispatch', to: 'agent-vendor', label: 'Quote Benchmark' },
    { from: 'agent-verify', to: 'agent-memory', label: 'Resolution Audit' },
    { from: 'agent-verify', to: 'agent-triage', label: 'Closure Feed' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Mission Control Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b0f1d] via-[#0f172a] to-[#0c1020] border border-violet-500/20 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                SocietyOps visualization
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Network className="w-3.5 h-3.5" />
                Demo map · not Switch presence
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Live Agent War Room
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                Visual Centerpiece
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Agent-role visualization and handoff history. Switch connection status is shown in the Switch Hub using the actual chat bridge state.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('integrated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'integrated'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unified Grid
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'diagram'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Switch Diagram
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'timeline'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Handoff Stream
            </button>
          </div>
        </div>
      </div>

      {/* Agent-role and room visualization */}
      {(viewMode === 'integrated' || viewMode === 'diagram') && (
        <SwitchHubDiagram
          agents={agents}
          rooms={switchRooms}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(ag) => {
            setSelectedAgentId(ag.id);
            onSelectAgent(ag);
          }}
          isSSEConnected={isSSEConnected}
        />
      )}

      {/* Agents Quick Selection Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          const isBusy = agent.status === 'analyzing' || agent.status === 'collaborating' || agent.status === 'active';

          return (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgentId(agent.id);
                onSelectAgent(agent);
              }}
              className={`p-3.5 rounded-xl text-left transition-all relative overflow-hidden group border ${
                isSelected
                  ? 'bg-violet-950/40 border-violet-500 shadow-lg shadow-violet-900/30 ring-1 ring-violet-500/50'
                  : 'bg-[#0a0f1d]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#0e1528]'
              }`}
            >
              {isBusy && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}

              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{agent.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{agent.switchHandle}</p>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-300 font-mono flex items-center justify-between">
                <span className="text-slate-500">Tasks</span>
                <span className="text-violet-400 font-semibold">{agent.processedIncidentsCount}</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-400 truncate">
                {agent.currentTask}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main War Room Body: Split View (Timeline Stream & Operator Directive Terminal) */}
      {(viewMode === 'integrated' || viewMode === 'timeline') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Real-time Timeline Stream */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0a0e1a]/90 rounded-2xl border border-white/[0.08] p-5 shadow-xl">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                    Agent Telemetry & Handoff Stream
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {['all', 'handoff', 'decision', 'correlation', 'audit'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`px-2.5 py-1 rounded-md capitalize transition ${
                        filterType === f
                          ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                          : 'text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Timeline Cards */}
              <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {filteredEvents.map((ev, index) => {
                    const badge = getEventBadge(ev.eventType);
                    const relatedIncident = ev.incidentId ? incidents.find(i => i.id === ev.incidentId) : null;

                    return (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 rounded-xl bg-[#0e1424]/70 border border-white/[0.06] hover:border-violet-500/30 transition group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              {ev.fromAgentName}
                              {ev.toAgentName && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-slate-500" />
                                  <span className="text-violet-300">{ev.toAgentName}</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-200 mb-1">{ev.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{ev.details}</p>

                        <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-500">#{ev.room}</span>
                          {relatedIncident && (
                            <button
                              onClick={() => onSelectIncident(relatedIncident)}
                              className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition"
                            >
                              <span>Inspect {ev.ticketNumber || relatedIncident.ticketNumber}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Col: Human-in-the-Loop Directive Dispatcher */}
          <div className="space-y-4">
            <div className="bg-[#0a0e1a]/90 rounded-2xl border border-white/[0.08] p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.08]">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Operator Directive Terminal
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Inject authoritative directives to steering agents in real-time. Directives are published to Switch rooms and recorded in audit ledgers.
              </p>

              <form onSubmit={handleSendDirective} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target AI Teammate
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full bg-[#0e1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Associated Incident Ticket (Optional)
                  </label>
                  <select
                    value={targetIncidentId}
                    onChange={(e) => setTargetIncidentId(e.target.value)}
                    className="w-full bg-[#0e1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition"
                  >
                    <option value="">General Society Operations (No specific ticket)</option>
                    {incidents.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.ticketNumber} — {i.title} ({i.flat})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Directive Instruction
                  </label>
                  <textarea
                    value={directiveText}
                    onChange={(e) => setDirectiveText(e.target.value)}
                    placeholder="e.g. Prioritize pipe thickness ultrasonic gauge over visual inspection, request secondary quote from RapidPlumb..."
                    rows={4}
                    className="w-full bg-[#0e1424] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !directiveText.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-violet-700/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Activity className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Directive to {selectedAgent?.name}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Selected Agent Inspection Card */}
            {selectedAgent && (
              <div className="bg-[#0a0e1a]/90 rounded-2xl border border-white/[0.08] p-5 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={selectedAgent.avatar}
                    alt={selectedAgent.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-violet-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedAgent.name}</h4>
                    <p className="text-xs text-violet-400">{selectedAgent.role}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Current Active Task</span>
                    <p className="text-slate-200 text-xs">{selectedAgent.currentTask}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Capabilities</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAgent.capabilities.map((cap) => (
                        <span key={cap} className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
