import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bot, 
  Terminal, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { AgentInfo, Incident, SwitchMessage } from '../types.js';

interface AgentDrawerProps {
  agent: AgentInfo | null;
  onClose: () => void;
  incidents: Incident[];
  switchMessages: SwitchMessage[];
  onNavigateToTab: (tab: any) => void;
  onSelectIncident: (inc: Incident) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  agent,
  onClose,
  incidents,
  switchMessages,
  onNavigateToTab,
  onSelectIncident,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'system-prompt'>('overview');

  if (!agent) return null;

  const currentIncident = incidents.find(
    (i) => i.id === agent.recentActivities[0]?.incidentId || i.id === 'INC-101'
  );

  const agentMessages = switchMessages.filter(
    (m) => m.sender.toLowerCase().includes(agent.name.toLowerCase()) || m.sender.toLowerCase().includes(agent.switchHandle.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-full max-w-xl h-full bg-[#0c101a] border-l border-white/[0.08] shadow-2xl flex flex-col text-white overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-slate-950 to-indigo-950/60 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0c101a]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{agent.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {agent.switchHandle}
                  </span>
                </div>
                <p className="text-xs text-blue-400 font-medium">{agent.role}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                  <span>Processed: <strong className="text-white">{agent.processedIncidentsCount}</strong></span>
                  <span>Status: <strong className="text-emerald-400 uppercase">{agent.status}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Task Banner */}
          <div className="px-6 py-3.5 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center gap-2.5 text-xs">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Current Task: </span>
              <span className="text-white font-medium">{agent.currentTask}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-6 border-b border-white/[0.08] bg-slate-900/30 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview & Capabilities
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-3 px-3 border-b-2 transition ${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Recent Switch Messages ({agentMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('system-prompt')}
              className={`py-3 px-3 border-b-2 transition ${
                activeTab === 'system-prompt'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              System Instructions
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs">
            {activeTab === 'overview' && (
              <>
                {/* Mandate */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Autonomous Operational Mandate
                  </span>
                  <p className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 leading-relaxed font-sans">
                    {agent.responsibility}
                  </p>
                </div>

                {/* Active Incident Link */}
                {currentIncident && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                      Currently Assigned Incident
                    </span>
                    <div
                      onClick={() => {
                        onClose();
                        onSelectIncident(currentIncident);
                      }}
                      className="p-3.5 rounded-xl bg-blue-950/30 hover:bg-blue-950/50 border border-blue-500/30 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            {currentIncident.ticketNumber}
                          </span>
                          <span className="text-white font-semibold truncate">{currentIncident.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {currentIncident.building} • {currentIncident.flat} ({currentIncident.status})
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-blue-400 shrink-0 ml-3" />
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Agent Capabilities
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {agent.capabilities.map((cap, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-slate-300 font-medium truncate">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity Log */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Recent Activity History
                  </span>
                  <div className="space-y-2">
                    {agent.recentActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{act.action}</span>
                          <span className="text-[10px] text-slate-500">{act.timestamp}</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">{act.details}</p>
                        <div className="pt-1 text-[10px] font-mono text-indigo-400">
                          Room: #{act.room}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-3">
                {agentMessages.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No recent Switch messages from this agent.
                  </div>
                ) : (
                  agentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-indigo-400">#{msg.roomId}</span>
                        <span className="text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-sans">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'system-prompt' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400">
                  Autonomous prompt and instructions loaded into the Gemini 3.8 Flash inference engine:
                </div>
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {agent.systemPrompt}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/[0.08] bg-slate-950/60 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Node ID: {agent.id}</span>
            <button
              onClick={() => {
                onClose();
                onNavigateToTab('switch');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Switch Room Stream</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
