import React, { useState, useEffect } from 'react';
import { Plus, Bell, RefreshCw, Search, Sparkles, Building, Command } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  pendingApprovalsCount: number;
  onNavigateToTab: (tab: any) => void;
  onGlobalSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onRefresh,
  isRefreshing,
  pendingApprovalsCount,
  onNavigateToTab,
  onGlobalSearchClick,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 bg-[#07090e]/80 backdrop-blur-xl border-b border-white/[0.08] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left side: Personalized greeting & time */}
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">
              {getGreeting()}, <span className="text-blue-400">Anil</span>
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-400 font-mono">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
              <span className="text-slate-300 font-bold">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Grand Orchids Residency • Autonomous Ops Active
            </span>
          </div>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onGlobalSearchClick || onOpenCreateModal}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-400 transition group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            <span>Search tickets, shaft risks, vendors, or agents...</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Operational State"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.08] transition"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {/* Approvals Bell */}
        <button
          onClick={() => onNavigateToTab('approvals')}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.08] transition"
          title="Pending Approvals"
        >
          <Bell className="w-4 h-4" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-900/40 animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        {/* Create Incident Button */}
        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-900/30 transition flex items-center gap-2 active:scale-95 border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Report Incident</span>
        </button>
      </div>
    </header>
  );
};
