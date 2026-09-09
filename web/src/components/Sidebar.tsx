import React from 'react';
import {
  CalendarDays,
  SlidersHorizontal,
  Trophy,
  Shield,
  Activity,
  Cpu,
  Radio,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { NavTab } from './Navbar';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  season: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  season,
}) => {
  const navItems = [
    {
      id: 'fixtures' as NavTab,
      label: 'Fixtures & Studio',
      Icon: CalendarDays,
      badge: '380',
    },
    {
      id: 'simulator' as NavTab,
      label: 'Match Simulator',
      Icon: SlidersHorizontal,
      badge: 'WHAT-IF',
    },
    {
      id: 'standings' as NavTab,
      label: 'League Matrix',
      Icon: Trophy,
      badge: 'TABLE',
    },
    {
      id: 'clubs' as NavTab,
      label: 'Club Intelligence',
      Icon: Shield,
      badge: 'CLUBS',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Model Benchmarks',
      Icon: Activity,
      badge: 'ML',
    },
  ];

  return (
    <aside className="w-full md:w-64 md:min-h-screen bg-surface border-r border-border flex flex-col justify-between flex-shrink-0 select-none">
      <div>
        {/* Brand & Studio Identity Header */}
        <div className="p-3.5 border-b border-border bg-background/60">
          <div className="flex items-center space-x-2.5">
            {/* Terminal Monogram Badge */}
            <Logo size={30} className="border-border shadow-inner" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold tracking-wider text-text-primary uppercase">
                  EPL PREDICTOR
                </span>
                {/* Live Status Pill */}
                <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-none bg-surface border border-border text-[9px] font-mono text-text-secondary">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  <span className="font-bold text-white tracking-widest text-[8px]">LIVE</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mt-0.5">
                <span>ANALYST WORKSTATION</span>
                <span className="text-text-secondary font-bold">{season}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Navigation Links */}
        <div className="p-2.5">
          <div className="px-2 py-1.5 text-[9px] font-mono uppercase tracking-widest text-text-muted flex items-center justify-between">
            <span>CORE MODULES</span>
            <span className="text-[8px] text-text-muted">NAV</span>
          </div>

          <nav className="space-y-1 mt-1">
            {navItems.map(({ id, label, Icon, badge }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-all rounded-none border ${
                    isActive
                      ? 'bg-surface-active text-white border-l-2 border-l-white border-t-border border-r-border border-b-border font-bold shadow-sm'
                      : 'text-text-secondary border-transparent hover:text-white hover:bg-surface-hover hover:border-border-subtle'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-text-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <span className="whitespace-nowrap tracking-tight">{label}</span>
                  </div>

                  {badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-none border whitespace-nowrap flex-shrink-0 ml-2 ${
                        isActive
                          ? 'bg-background border-white/40 text-white font-bold'
                          : 'bg-background/80 border-border text-text-muted'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Telemetry & Architecture Specs */}
      <div className="p-3 border-t border-border bg-background/50 space-y-2 font-mono text-[9px]">
        <div className="text-[8px] uppercase tracking-widest text-text-muted pb-1 border-b border-border-subtle flex items-center justify-between">
          <span>SYSTEM TELEMETRY</span>
          <Terminal className="h-2.5 w-2.5 text-text-muted" />
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-text-muted">
            <Cpu className="h-3 w-3 mr-1.5 text-text-secondary" />
            DUAL ENGINE
          </span>
          <span className="text-white font-bold">RF + XGBOOST</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-text-muted">
            <Radio className="h-3 w-3 mr-1.5 text-text-secondary" />
            GOAL ESTIMATOR
          </span>
          <span className="text-white font-bold">POISSON xG</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-text-muted">
            <ShieldCheck className="h-3 w-3 mr-1.5 text-text-secondary" />
            DATA INTEGRITY
          </span>
          <span className="text-text-secondary">ZERO LEAKAGE</span>
        </div>

        <div className="pt-1.5 border-t border-border-subtle flex items-center justify-between text-[8px] text-text-muted">
          <span>SCHEDULE: 380 MATCHES</span>
          <span className="text-white font-bold">v2.4-PROD</span>
        </div>
      </div>
    </aside>
  );
};
