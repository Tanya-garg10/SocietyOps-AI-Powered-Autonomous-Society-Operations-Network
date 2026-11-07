import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Bot, 
  Network, 
  GitMerge, 
  ShieldCheck, 
  Camera, 
  Truck, 
  History,
  Radio,
  Building2,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Flame,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { SwitchIntegrationStatus } from '../types.js';

export type NavTab = 
  | 'command-center'
  | 'war-room'
  | 'incidents'
  | 'detective'
  | 'heatmap'
  | 'predictive'
  | 'approvals'
  | 'verification'
  | 'agents'
  | 'switch'
  | 'vendors'
  | 'audit';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  openIncidentsCount: number;
  activeAgentsCount: number;
  switchStatus: SwitchIntegrationStatus;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  openIncidentsCount,
  activeAgentsCount,
  switchStatus,
  collapsed = false,
  onToggleCollapse,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'war-room', label: 'Live War Room', icon: Radio, badge: 'Live', badgeColor: 'bg-violet-500/30 text-violet-200 border border-violet-400/40 shadow-[0_0_8px_rgba(139,92,246,0.3)] animate-pulse' },
    { id: 'incidents', label: 'Incident Desk', icon: AlertCircle, badge: openIncidentsCount, badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    { id: 'detective', label: 'Incident Detective', icon: BrainCircuit, badge: 'AI Root', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
    { id: 'heatmap', label: 'Risk Heatmap', icon: Flame, badge: 'Topology', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    { id: 'predictive', label: 'Predictive Intel', icon: TrendingUp, badge: 'Savings', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'approvals', label: 'Approval Gate', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined, badgeColor: 'bg-rose-500 text-white font-bold' },
    { id: 'verification', label: 'Proof Score', icon: Camera },
    { id: 'agents', label: 'AI Teammates', icon: Bot, badge: `${activeAgentsCount} Active`, badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'switch', label: 'Switch Hub', icon: Network, badge: switchStatus.connected ? 'Live' : 'Local', badgeColor: switchStatus.connected ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-amber-500/20 text-amber-300' },
    { id: 'vendors', label: 'Vendors', icon: Truck },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-[#05070c] text-slate-300 flex flex-col border-r border-white/[0.08] shrink-0 select-none transition-all duration-300 relative z-20`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-900/40 ring-1 ring-white/20 shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">SocietyOps</span>
                <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-300 border border-blue-400/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Autonomous Operations</p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Society Context */}
      {!collapsed && (
        <div className="px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200 truncate">Grand Orchids</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
              4 Blocks
            </span>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-300 px-3 py-1.5">
            Command Menu
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-violet-600/90 text-white shadow-lg shadow-indigo-900/30 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor || 'bg-white/10 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Local app event stream indicator */}
      {!collapsed && (
        <div className="p-3.5 m-2.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-indigo-950/40 border border-indigo-500/20 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Radio
                className={`w-3.5 h-3.5 ${
                  switchStatus.connected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                }`}
              />
              <span className="text-xs font-bold text-slate-200">Switch Chat</span>
            </div>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                switchStatus.connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {switchStatus.connected ? 'CONNECTED' : switchStatus.state.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            {switchStatus.connected
              ? `${switchStatus.connectedRoomIds.length} Discord channel(s) configured. Connect the same channels to Switch for agent replies.`
              : 'Local preview only. Configure Discord and connect its channels to Switch.'}
          </p>
        </div>
      )}

      {/* User profile */}
      <div className="p-3.5 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/20 flex items-center justify-center font-bold text-xs text-white shrink-0">
            AM
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">Anil Mehta</div>
              <div className="text-[10px] text-slate-400 truncate">Operations Director</div>
            </div>
          )}
        </div>
        {!collapsed && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />}
      </div>
    </aside>
  );
};
