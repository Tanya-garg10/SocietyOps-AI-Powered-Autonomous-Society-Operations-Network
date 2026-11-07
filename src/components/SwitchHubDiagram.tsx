import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Radio, 
  Hash, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Network, 
  Zap, 
  Search, 
  Wrench, 
  ShieldCheck, 
  Camera, 
  Cpu, 
  ExternalLink 
} from 'lucide-react';
import { AgentInfo, SwitchRoom } from '../types.js';

interface SwitchHubDiagramProps {
  agents: AgentInfo[];
  rooms?: SwitchRoom[];
  selectedAgentId?: string;
  selectedRoomId?: string;
  onSelectAgent?: (agent: AgentInfo) => void;
  onSelectRoom?: (roomId: string) => void;
  isSSEConnected?: boolean;
}

// Fallback seed agents in case parent agents array is loading
const FALLBACK_AGENTS: Partial<AgentInfo>[] = [
  { id: 'agent-triage', name: 'Triage Agent', role: 'Incident Ingestion & Priority', switchHandle: '@triage-agent', status: 'active', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', currentTask: 'Monitoring resident reports' },
  { id: 'agent-intel', name: 'Intelligence Agent', role: 'Root Cause & Correlation', switchHandle: '@intel-agent', status: 'analyzing', avatar: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80', currentTask: 'Correlating Block B riser reports' },
  { id: 'agent-dispatch', name: 'Dispatch Agent', role: 'Workforce Routing', switchHandle: '@dispatch-agent', status: 'active', avatar: '/dispatch-agent.svg', currentTask: 'Plumber dispatch prepared' },
  { id: 'agent-vendor', name: 'Vendor Agent', role: 'Quotation Review', switchHandle: '@vendor-agent', status: 'active', avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80', currentTask: 'Benchmarking AquaFix vs RapidPlumb' },
  { id: 'agent-verify', name: 'Verification Agent', role: 'Resolution Quality Audit', switchHandle: '@verify-agent', status: 'active', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', currentTask: 'Auditing resolution evidence' },
  { id: 'agent-memory', name: 'Memory Agent', role: 'Operational Knowledge Graph', switchHandle: '@memory-agent', status: 'active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', currentTask: 'Tracking chronic infrastructure risks' },
];

export const SwitchHubDiagram: React.FC<SwitchHubDiagramProps> = ({
  agents,
  rooms = [],
  selectedAgentId,
  selectedRoomId,
  onSelectAgent,
  onSelectRoom,
  isSSEConnected = false,
}) => {
  const [hoveredNode, setHoveredNode] = useState<{ id: string; name: string; type: 'agent' | 'room' | 'hub'; details?: string } | null>(null);
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(() => new Set());

  // Merge provided agents with fallback to ensure all 6 agents always render
  const mergedAgents: AgentInfo[] = FALLBACK_AGENTS.map((fallback) => {
    const existing = agents.find((a) => a.id === fallback.id);
    return (existing || {
      ...fallback,
      processedIncidentsCount: 35,
      lastActive: 'Just now',
      capabilities: ['Switch protocol', 'Autonomous operations'],
      systemPrompt: '',
      responsibility: fallback.role || '',
      recentActivities: [],
    }) as AgentInfo;
  });

  // Coordinates for the six agents around the outer ring.
  const agentPositions: Record<string, { x: number; y: number; color: string; border: string; glow: string; role: string; label: string }> = {
    'agent-triage': { x: 420, y: 58, color: '#38bdf8', border: 'border-cyan-500', glow: 'rgba(56, 189, 248, 0.4)', role: 'Triage & Ingestion', label: 'Triage Agent' },
    'agent-intel': { x: 690, y: 122, color: '#a78bfa', border: 'border-violet-500', glow: 'rgba(167, 139, 250, 0.4)', role: 'Root Cause & Correlation', label: 'Intelligence Agent' },
    'agent-dispatch': { x: 690, y: 298, color: '#60a5fa', border: 'border-blue-500', glow: 'rgba(96, 165, 250, 0.4)', role: 'Workforce Routing', label: 'Dispatch Agent' },
    'agent-memory': { x: 420, y: 358, color: '#c084fc', border: 'border-purple-500', glow: 'rgba(192, 132, 252, 0.4)', role: 'Knowledge Graph', label: 'Memory Agent' },
    'agent-vendor': { x: 150, y: 298, color: '#f59e0b', border: 'border-amber-500', glow: 'rgba(245, 158, 11, 0.4)', role: 'Vendor Procurement', label: 'Vendor Agent' },
    'agent-verify': { x: 150, y: 122, color: '#10b981', border: 'border-emerald-500', glow: 'rgba(16, 185, 129, 0.4)', role: 'Resolution Audit', label: 'Verification Agent' },
  };
  const agentIcons: Record<string, typeof Wrench> = {
    'agent-triage': ShieldCheck,
    'agent-intel': Search,
    'agent-dispatch': Wrench,
    'agent-vendor': Layers,
    'agent-verify': Camera,
    'agent-memory': Cpu,
  };

  // 4 Switch Room satellite positions around inner orbit
  const roomPositions: Record<string, { x: number; y: number; color: string; label: string }> = {
    'society-control': { x: 420, y: 146, color: '#38bdf8', label: '#society-control' },
    'incident-water-leak-001': { x: 550, y: 210, color: '#a78bfa', label: '#incident-water-leak' },
    'resolution-review': { x: 420, y: 274, color: '#10b981', label: '#resolution-review' },
    'vendor-coordination': { x: 290, y: 210, color: '#f59e0b', label: '#vendor-coordination' },
  };

  const defaultRoomsList = rooms.length > 0
    ? rooms.map((room) => ({ id: room.id, name: room.name, count: room.messageCount }))
    : [
        { id: 'society-control', name: '#society-control', count: 0 },
        { id: 'incident-water-leak-001', name: '#incident-water-leak-001', count: 0 },
        { id: 'resolution-review', name: '#resolution-review', count: 0 },
        { id: 'vendor-coordination', name: '#vendor-coordination', count: 0 },
      ];

  // Inter-agent active collaboration lines
  const interAgentWires = [
    { from: 'agent-triage', to: 'agent-intel', color: '#38bdf8' },
    { from: 'agent-intel', to: 'agent-dispatch', color: '#a78bfa' },
    { from: 'agent-dispatch', to: 'agent-vendor', color: '#60a5fa' },
    { from: 'agent-vendor', to: 'agent-verify', color: '#f59e0b' },
    { from: 'agent-verify', to: 'agent-memory', color: '#10b981' },
    { from: 'agent-memory', to: 'agent-triage', color: '#c084fc' },
  ];

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#090d19] via-[#070a14] to-[#04060c] border border-violet-500/30 shadow-2xl overflow-hidden p-4 md:p-6 select-none">
      {/* Background Architectural Grid & Luminous Ambient Radial Light */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[400px] bg-violet-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-60 h-60 bg-cyan-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Banner Information */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-sm font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <Network className="w-4 h-4 text-violet-400" />
              <span>SocietyOps Collaboration Map</span>
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            SocietyOps collaboration map
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>6 SocietyOps Agent Roles</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>4 Logical Rooms</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            <Radio className={`w-3 h-3 ${isSSEConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{isSSEConnected ? 'SocietyOps UI Stream: Online' : 'SocietyOps UI Stream: Offline'}</span>
          </span>
        </div>
      </div>

      {/* Interactive SVG Topology Canvas */}
      <div className="relative w-full h-[360px] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 840 430"
          className="w-full h-full max-w-5xl overflow-visible select-none"
        >
          {/* SVG Definitions for Avatars Clip-paths */}
          <defs>
            {mergedAgents.map((ag) => (
              <clipPath key={ag.id} id={`clip-${ag.id}`}>
                <circle cx="22" cy="22" r="21" />
              </clipPath>
            ))}
          </defs>

          {/* Outer Orbital Ring */}
          <ellipse
            cx="420"
            cy="210"
            rx="300"
            ry="152"
            fill="none"
            stroke="rgba(139, 92, 246, 0.18)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />

          {/* Inner Orbital Ring for Rooms */}
          <ellipse
            cx="420"
            cy="210"
            rx="160"
            ry="100"
            fill="none"
            stroke="rgba(56, 189, 248, 0.12)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {/* Inter-Agent Collaboration Cross-Bridges with Moving Signals */}
          {interAgentWires.map((wire, idx) => {
            const fromPos = agentPositions[wire.from];
            const toPos = agentPositions[wire.to];
            if (!fromPos || !toPos) return null;

            return (
              <g key={idx}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={wire.color}
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Moving Signal Pulse Dot */}
                <circle r="3" fill={wire.color}>
                  <animateMotion
                    path={`M ${fromPos.x},${fromPos.y} L ${toPos.x},${toPos.y}`}
                    dur={`${3 + (idx % 3) * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Radial Wires: Hub -> Room Nodes */}
          {Object.entries(roomPositions).map(([roomId, pos]) => (
            <g key={`hub-room-${roomId}`}>
              <line
                x1="420"
                y1="210"
                x2={pos.x}
                y2={pos.y}
                stroke={pos.color}
                strokeOpacity="0.4"
                strokeWidth="2"
              />
              <circle r="2.5" fill={pos.color}>
                <animateMotion
                  path={`M 420,210 L ${pos.x},${pos.y}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}

          {/* Radial Wires: Room Nodes -> Agents */}
          {mergedAgents.map((ag) => {
            const pos = agentPositions[ag.id];
            if (!pos) return null;

            return (
              <g key={`hub-agent-${ag.id}`}>
                <line
                  x1="420"
                  y1="210"
                  x2={pos.x}
                  y2={pos.y}
                  stroke={pos.color}
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
                <circle r="3" fill={pos.color}>
                  <animateMotion
                    path={`M 420,210 L ${pos.x},${pos.y}`}
                    dur="3.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* SocietyOps role and room map center */}
          {/* ======================================================== */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredNode({ id: 'switch-hub-core', name: 'SocietyOps Collaboration Map', type: 'hub', details: 'Visual map of SocietyOps agent roles and configured chat rooms. Discord carries messages to and from Switch-connected rooms.' })}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Outermost expanding radar wave */}
            <circle cx="420" cy="210" r="70" fill="rgba(139, 92, 246, 0.05)" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1">
              <animate attributeName="r" values="55;75;55" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="4s" repeatCount="indefinite" />
            </circle>

            {/* Core Housing */}
            <circle cx="420" cy="210" r="50" fill="#080c18" stroke="#8b5cf6" strokeWidth="2.5" className="filter drop-shadow-[0_0_15px_rgba(139, 92, 246, 0.5)]" />
            <circle cx="420" cy="210" r="38" fill="rgba(99, 102, 241, 0.25)" />
            <circle cx="420" cy="210" r="26" fill="rgba(139, 92, 246, 0.4)" />

            {/* Core Text Labels */}
            <text x="420" y="203" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="monospace">
              SOCIETYOPS
            </text>
            <text x="420" y="217" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
              SocietyOps
            </text>
            <text x="420" y="228" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold" fontFamily="monospace">
              CHAT MAP
            </text>
          </g>

          {/* ======================================================== */}
          {/* 4 SWITCH ROOM SATELLITE NODES                            */}
          {/* ======================================================== */}
          {defaultRoomsList.map((room) => {
            const pos = roomPositions[room.id] || { x: 420, y: 210, color: '#38bdf8', label: room.name };
            const isSelected = selectedRoomId === room.id;

            return (
              <g
                key={room.id}
                className="cursor-pointer group"
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectRoom && onSelectRoom(room.id)}
                onMouseEnter={() => setHoveredNode({ id: room.id, name: room.name, type: 'room', details: 'Logical SocietyOps room. A Discord channel is live only when its Switch connection status is connected.' })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Room Pill Box */}
                <rect
                  x="-55"
                  y="-12"
                  width="110"
                  height="24"
                  rx="12"
                  fill="#080e1e"
                  stroke={isSelected ? '#ffffff' : pos.color}
                  strokeWidth={isSelected ? 2 : 1.2}
                  className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                />

                {/* Status Dot */}
                <circle cx="-42" cy="0" r="3" fill={pos.color} />

                {/* Room Label */}
                <text
                  x="-32"
                  y="4"
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {pos.label}
                </text>

                {/* Message count pill on right */}
                <rect x="34" y="-7" width="16" height="14" rx="7" fill="rgba(255, 255, 255, 0.1)" />
                <text x="42" y="3" textAnchor="middle" fill={pos.color} fontSize="7" fontWeight="bold" fontFamily="monospace">
                  {room.count}
                </text>
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* 6 AI AGENT NODES (LARGE, CRISP, BEAUTIFULLY STYLED)      */}
          {/* ======================================================== */}
          {mergedAgents.map((ag) => {
            const pos = agentPositions[ag.id] || { x: 420, y: 210, color: '#818cf8', border: 'border-indigo-500', glow: 'rgba(129, 140, 248, 0.4)', role: ag.role, label: ag.name };
            const isSelected = selectedAgentId === ag.id;

            return (
              <g
                key={ag.id}
                className="cursor-pointer group"
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectAgent && onSelectAgent(ag)}
                onMouseEnter={() => setHoveredNode({ id: ag.id, name: ag.name, type: 'agent', details: `${ag.switchHandle} • ${ag.currentTask || ag.role}` })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer Breathing Halo Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 38 : 34}
                  fill="none"
                  stroke={pos.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={isSelected ? 'none' : '4 3'}
                  className="transition-all duration-300"
                />

                {/* Color Glow Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="28"
                  fill={pos.glow}
                  className="transition-all duration-300"
                />

                {/* Avatar Housing */}
                <circle
                  cx="0"
                  cy="0"
                  r="23"
                  fill="#0c1020"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {failedAvatars.has(ag.id) || !ag.avatar ? (
                  <>
                    <circle cx="0" cy="0" r="21" fill="#111a2b" />
                    {React.createElement(agentIcons[ag.id] || Bot, {
                      x: -11,
                      y: -11,
                      width: 22,
                      height: 22,
                      color: pos.color,
                      strokeWidth: 1.8,
                    })}
                  </>
                ) : (
                  <g transform="translate(-22, -22)">
                    <image
                      href={ag.avatar}
                      x="0"
                      y="0"
                      width="44"
                      height="44"
                      clipPath={`url(#clip-${ag.id})`}
                      preserveAspectRatio="xMidYMid slice"
                      onError={() => {
                        setFailedAvatars((current) => new Set(current).add(ag.id));
                      }}
                    />
                  </g>
                )}

                {/* Role indicator; this is not a live Switch presence indicator. */}
                <circle
                  cx="16"
                  cy="-16"
                  r="4.5"
                  fill={pos.color}
                  stroke="#060913"
                  strokeWidth="1.5"
                />

                {/* Node Tag Card Below Avatar */}
                <g transform="translate(0, 36)">
                  <rect
                    x="-65"
                    y="-9"
                    width="130"
                    height="20"
                    rx="10"
                    fill="#080c18"
                    stroke={isSelected ? '#ffffff' : pos.color}
                    strokeWidth={isSelected ? 1.8 : 1}
                    className="filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {pos.label}
                  </text>
                </g>

                {/* Role Tag Subtitle */}
                <g transform="translate(0, 56)">
                  <rect
                    x="-55"
                    y="-6"
                    width="110"
                    height="14"
                    rx="7"
                    fill="rgba(15, 23, 42, 0.8)"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={pos.color}
                    fontSize="7.5"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {pos.role}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Inspector / Selection Banner */}
      <div className="relative z-10 mt-2 p-3 rounded-xl bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider">Node Telemetry:</span>
          {hoveredNode ? (
            <div className="flex items-center gap-2 text-white">
              <span className={`w-2 h-2 rounded-full ${hoveredNode.type === 'agent' ? 'bg-cyan-400' : hoveredNode.type === 'room' ? 'bg-violet-400' : 'bg-emerald-400'}`} />
              <strong className="text-cyan-300 font-bold">{hoveredNode.name}</strong>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 text-[11px]">{hoveredNode.details}</span>
            </div>
          ) : (
            <span className="text-slate-500 text-[11px]">Hover or click any Agent or Switch Room node to inspect real-time routing status.</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Map:</span>
          <span className="text-slate-300 font-bold">SocietyOps room layout</span>
        </div>
      </div>

      {/* Quick Clickable All-Nodes Ribbon Bar */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">6 SocietyOps agent roles:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {mergedAgents.map((ag) => {
            const isSelected = selectedAgentId === ag.id;
            const pos = agentPositions[ag.id];

            return (
              <button
                key={ag.id}
                onClick={() => onSelectAgent && onSelectAgent(ag)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-700/40 font-bold'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pos?.color || '#38bdf8' }} />
                <span>{ag.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
