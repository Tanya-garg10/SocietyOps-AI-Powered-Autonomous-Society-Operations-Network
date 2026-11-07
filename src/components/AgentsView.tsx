import React, { useState } from 'react';
import { 
  Bot, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Cpu, 
  Code, 
  ChevronRight,
  Shield,
  Search,
  Wrench,
  Camera,
  Layers,
  Zap,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentInfo } from '../types.js';

interface AgentsViewProps {
  agents: AgentInfo[];
  onNavigateToTab: (tab: any) => void;
  onSelectAgentDrawer?: (agent: AgentInfo) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({ 
  agents, 
  onNavigateToTab,
  onSelectAgentDrawer 
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(agents[0] || null);
  const [activeTab, setActiveTab] = useState<'activity' | 'system-prompt' | 'capabilities'>('activity');

  const agentIcons: Record<string, React.ElementType> = {
    'agent-triage': Shield,
    'agent-intel': Search,
    'agent-dispatch': Wrench,
    'agent-vendor': Layers,
    'agent-verify': Camera,
    'agent-memory': Cpu,
  };

  const statusStyles: Record<string, { bg: string; text: string; dot: string; glow: string }> = {
    active: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'Active Monitoring', dot: 'bg-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
    analyzing: { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', text: 'Analyzing Correlation', dot: 'bg-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]' },
    collaborating: { bg: 'bg-violet-500/20 text-violet-300 border-violet-500/30', text: 'Switch Room Stream', dot: 'bg-violet-400', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]' },
    waiting_approval: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'Awaiting Gatekeeper', dot: 'bg-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
    idle: { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30', text: 'Standby / Polling', dot: 'bg-slate-400', glow: '' },
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Autonomous AI Teammates</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono font-semibold border border-violet-500/30">
              Switch Protocol Runtime
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            6 specialized autonomous agents collaborating asynchronously over Switch rooms to resolve residential incidents
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('switch')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 transition flex items-center gap-2 self-start border border-white/10"
        >
          <Bot className="w-4 h-4" />
          <span>Switch Collaborative Rooms →</span>
        </button>
      </div>

      {/* Main Grid: Agent Cards on Left, Selected Agent Deep Dive on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Roster List */}
        <div className="lg:col-span-1 space-y-3">
          {agents.map((ag) => {
            const isSelected = selectedAgent?.id === ag.id;
            const statusConfig = statusStyles[ag.status] || statusStyles.idle;
            const Icon = agentIcons[ag.id] || Bot;

            return (
              <motion.div
                key={ag.id}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                onClick={() => {
                  setSelectedAgent(ag);
                  if (onSelectAgentDrawer) onSelectAgentDrawer(ag);
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#0e1424] to-[#0a0e19] border-indigo-500 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                    : 'bg-[#0c101a] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={ag.avatar}
                      alt={ag.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 shadow-md"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0c101a] ${statusConfig.dot}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white truncate">{ag.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{ag.switchHandle}</span>
                    </div>
                    <p className="text-xs text-blue-400 font-medium truncate mt-0.5">{ag.role}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">{ag.processedIncidentsCount} tickets handled</span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusConfig.bg}`}>
                        {statusConfig.text}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Agent Detailed Deep Dive */}
        {selectedAgent && (
          <div className="lg:col-span-2 bg-[#0c101a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-slate-950 to-indigo-950/70">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedAgent.avatar}
                    alt={selectedAgent.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-2xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{selectedAgent.name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {selectedAgent.switchHandle}
                      </span>
                    </div>
                    <p className="text-xs text-blue-300 font-medium mt-0.5">{selectedAgent.role}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
                      <span>Handled: <strong className="text-white">{selectedAgent.processedIncidentsCount}</strong></span>
                      <span>Last Active: <strong className="text-white">{selectedAgent.lastActive}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Autonomous Active
                  </span>
                </div>
              </div>

              {/* Current Task banner */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2.5 text-xs">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                <span className="text-slate-400">Current Task:</span>
                <span className="text-white font-medium truncate">{selectedAgent.currentTask}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.08] px-6 bg-white/[0.02] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-3 px-4 border-b-2 transition ${
                  activeTab === 'activity'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Recent Activity Log ({selectedAgent.recentActivities.length})
              </button>
              <button
                onClick={() => setActiveTab('system-prompt')}
                className={`py-3 px-4 border-b-2 transition ${
                  activeTab === 'system-prompt'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                System Instructions & Prompt
              </button>
              <button
                onClick={() => setActiveTab('capabilities')}
                className={`py-3 px-4 border-b-2 transition ${
                  activeTab === 'capabilities'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Tool Calling & Capabilities ({selectedAgent.capabilities.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 flex-1 overflow-y-auto text-xs space-y-4">
              {activeTab === 'activity' && (
                <div className="space-y-3">
                  <div className="text-slate-400">
                    Audit of actions dispatched by <strong>{selectedAgent.name}</strong> to Switch rooms:
                  </div>
                  <div className="divide-y divide-white/[0.06] border rounded-2xl border-white/[0.08] overflow-hidden bg-white/[0.02]">
                    {selectedAgent.recentActivities.map((act) => (
                      <div key={act.id} className="p-4 hover:bg-white/[0.02] transition space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{act.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans">{act.details}</p>
                        <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                          <span className="text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                            Room: #{act.room}
                          </span>
                          {act.incidentId && (
                            <span className="text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                              Ticket: {act.incidentId}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'system-prompt' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Autonomous instruction prompt executed with Gemini 3.8 Flash:</span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      model: gemini-3.8-flash
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 text-slate-200 font-mono leading-relaxed border border-white/10 overflow-x-auto">
                    <div className="text-slate-500 mb-2">// System Instructions for {selectedAgent.name}</div>
                    <p className="text-emerald-400 whitespace-pre-wrap">{selectedAgent.systemPrompt}</p>
                    <div className="mt-4 pt-3 border-t border-white/10 text-slate-400">
                      // Operational Mandate:{'\n'}
                      {selectedAgent.responsibility}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'capabilities' && (
                <div className="space-y-3">
                  <div className="text-slate-400">
                    Registered functions and tools invoked by this agent during autonomous execution:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAgent.capabilities.map((cap, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
                        <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-white">{cap}</div>
                          <div className="text-[11px] text-slate-400">
                            Autonomous executable function registered with Switch protocol runtime.
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
