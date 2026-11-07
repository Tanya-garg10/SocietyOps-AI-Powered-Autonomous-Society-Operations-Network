import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Radio, AlertTriangle, ShieldCheck, Cpu, Search, Wrench, Camera, Layers, Zap } from 'lucide-react';
import { AgentInfo, Incident } from '../types.js';

interface NetworkConstellationProps {
  agents: AgentInfo[];
  incidents: Incident[];
  onSelectAgent: (agent: AgentInfo) => void;
  onSelectIncident: (inc: Incident) => void;
  isSSEConnected: boolean;
}

export const NetworkConstellation: React.FC<NetworkConstellationProps> = ({
  agents,
  incidents,
  onSelectAgent,
  onSelectIncident,
  isSSEConnected,
}) => {
  const [hoveredAgent, setHoveredAgent] = useState<AgentInfo | null>(null);

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const focalIncident = incidents.find((i) => i.id === 'INC-101') || incidents[0];

  const safeAgents = agents.length > 0 ? agents : ([
    { id: 'agent-triage', name: 'Triage Agent', switchHandle: '@triage-agent', role: 'Ingestion' },
    { id: 'agent-intel', name: 'Intelligence Agent', switchHandle: '@intel-agent', role: 'Correlation' },
    { id: 'agent-dispatch', name: 'Dispatch Agent', switchHandle: '@dispatch-agent', role: 'Routing' },
    { id: 'agent-vendor', name: 'Vendor Agent', switchHandle: '@vendor-agent', role: 'Procurement' },
    { id: 'agent-verify', name: 'Verification Agent', switchHandle: '@verify-agent', role: 'Audit' },
    { id: 'agent-memory', name: 'Memory Agent', switchHandle: '@memory-agent', role: 'Memory' },
  ] as AgentInfo[]);

  // Coordinates for the 6 agents around a central ellipse (500x320 viewBox)
  const agentPositions: Record<string, { x: number; y: number; color: string; icon: React.ElementType; shortName: string }> = {
    'agent-triage': { x: 250, y: 55, color: '#38bdf8', icon: ShieldCheck, shortName: 'TRI' },
    'agent-intel': { x: 410, y: 110, color: '#818cf8', icon: Search, shortName: 'INT' },
    'agent-dispatch': { x: 420, y: 240, color: '#60a5fa', icon: Wrench, shortName: 'DSP' },
    'agent-memory': { x: 250, y: 270, color: '#c084fc', icon: Cpu, shortName: 'MEM' },
    'agent-vendor': { x: 80, y: 240, color: '#f59e0b', icon: Layers, shortName: 'VEN' },
    'agent-verify': { x: 90, y: 110, color: '#10b981', icon: Camera, shortName: 'VER' },
  };

  return (
    <div className="relative w-full h-[360px] rounded-2xl bg-gradient-to-b from-[#090d16] via-[#070a12] to-[#05070c] border border-white/[0.08] overflow-hidden p-4 shadow-2xl flex flex-col justify-between">
      {/* Background architectural grid and ambient radial light */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header overlay */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            SocietyOps Agent Workflow Map
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          <Radio className={`w-3 h-3 ${isSSEConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>{isSSEConnected ? 'SocietyOps events: Connected' : 'Connecting to app events...'}</span>
        </div>
      </div>

      {/* SVG Canvas for Network Lines & Nodes */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        <svg
          viewBox="0 0 500 320"
          className="w-full h-full max-w-2xl overflow-visible select-none"
        >
          {/* Subtle Outer Orbit Ring */}
          <ellipse
            cx="250"
            cy="170"
            rx="195"
            ry="125"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 6"
          />

          {/* Connection Lines from Center Hub to Agents */}
          {safeAgents.map((ag) => {
            const pos = agentPositions[ag.id] || { x: 250, y: 170, color: '#818cf8', icon: Bot, shortName: 'AI' };
            return (
              <g key={ag.id}>
                {/* Background line */}
                <line
                  x1="250"
                  y1="170"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="rgba(99, 102, 241, 0.35)"
                  strokeWidth="1.5"
                />
                {/* Animated traveling signal particle */}
                <circle r="2.5" fill={pos.color}>
                  <animateMotion
                    path={`M 250,170 L ${pos.x},${pos.y}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Inter-Agent Collaboration Cross-Bridges */}
          {/* Triage -> Intel */}
          <line x1="250" y1="55" x2="410" y2="110" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 4" />
          {/* Intel -> Dispatch */}
          <line x1="410" y1="110" x2="420" y2="240" stroke="rgba(129, 140, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 4" />
          {/* Dispatch -> Vendor */}
          <line x1="420" y1="240" x2="80" y2="240" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1.5" strokeDasharray="3 4" />
          {/* Vendor -> Verify */}
          <line x1="80" y1="240" x2="90" y2="110" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" strokeDasharray="3 4" />
          {/* Verify -> Triage */}
          <line x1="90" y1="110" x2="250" y2="55" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 4" />

          {/* Central Hub Node:           SocietyOps Workflow */}
          <g className="cursor-pointer">
            <circle cx="250" cy="170" r="32" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" />
            <circle cx="250" cy="170" r="42" fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
            <circle cx="250" cy="170" r="24" fill="rgba(79, 70, 229, 0.25)" />
            <text x="250" y="165" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
              WORKFLOW
            </text>
            <text x="250" y="177" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              event map
            </text>
          </g>

          {/* Agent Nodes */}
          {safeAgents.map((ag) => {
            const pos = agentPositions[ag.id] || { x: 250, y: 170, color: '#818cf8', icon: Bot, shortName: 'AI' };
            const isHovered = hoveredAgent?.id === ag.id;

            return (
              <g
                key={ag.id}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectAgent(ag)}
                onMouseEnter={() => setHoveredAgent(ag)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                {/* Glowing ring on hover */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="28"
                    fill="none"
                    stroke={pos.color}
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                )}
                {/* Node Body */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="23"
                  fill="#0b0f19"
                  stroke={pos.color}
                  strokeWidth={isHovered ? '2.5' : '1.5'}
                />
                <text
                  x={pos.x}
                  y={pos.y + 3}
                  textAnchor="middle"
                  fill={pos.color}
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {pos.shortName}
                </text>
                {/* Active pulse dot */}
                <circle cx={pos.x + 14} cy={pos.y - 14} r="4" fill="#10b981" />

                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 32}
                  textAnchor="middle"
                  fill={isHovered ? '#ffffff' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {ag.name.replace(' Agent', '')}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 44}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {ag.switchHandle}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Inspector Bar at bottom on Hover */}
      <div className="relative z-10 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center justify-between text-xs">
        {hoveredAgent ? (
          <div className="flex items-center gap-3 truncate">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              {hoveredAgent.name}
            </span>
            <span className="text-slate-400 truncate">
              Task: <strong className="text-slate-200">{hoveredAgent.currentTask}</strong>
            </span>
            <span className="font-mono text-emerald-400 text-[10px] ml-auto">
              {hoveredAgent.processedIncidentsCount} tickets handled
            </span>
          </div>
        ) : focalIncident ? (
          <div
            onClick={() => onSelectIncident(focalIncident)}
            className="flex items-center justify-between w-full cursor-pointer hover:text-blue-300 transition"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                ACTIVE FOCUS
              </span>
              <span className="text-slate-300 font-medium truncate">
                {focalIncident.ticketNumber} — {focalIncident.title}
              </span>
            </div>
            <span className="text-[11px] text-blue-400 font-semibold shrink-0 ml-2">
              Inspect Resolution Loop →
            </span>
          </div>
        ) : (
          <span className="text-slate-400">Hover any autonomous agent node to inspect real-time state.</span>
        )}
      </div>
    </div>
  );
};
