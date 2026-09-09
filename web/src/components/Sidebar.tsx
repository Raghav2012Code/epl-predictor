import React from 'react';
import { Trophy, Calendar, Swords, BarChart3, Shield, Cpu, Radio } from 'lucide-react';
import { NavTab } from './Navbar';

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
    { id: 'fixtures' as NavTab, label: 'Fixtures & Studio', Icon: Calendar, badge: '380' },
    { id: 'simulator' as NavTab, label: 'Match Simulator', Icon: Swords, badge: 'WHAT-IF' },
    { id: 'standings' as NavTab, label: 'League Matrix', Icon: Trophy, badge: '20' },
    { id: 'clubs' as NavTab, label: 'Club Intelligence', Icon: Shield, badge: 'DEEP-DIVE' },
    { id: 'analytics' as NavTab, label: 'Model Benchmarks', Icon: BarChart3, badge: 'DUAL' },
  ];

  return (
    <aside className="w-full md:w-60 md:min-h-screen bg-surface border-r border-border flex flex-col justify-between flex-shrink-0 select-none">
      <div>
        {/* Workspace Brand Header */}
        <div className="p-3 border-b border-border bg-surface-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-none bg-background border border-border flex items-center justify-center text-brand-accent font-black text-xs font-mono shadow-inner">
                PL
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-xs font-black tracking-wider text-text-primary uppercase">
                    EPL INTEL
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded-none bg-background border border-border text-brand-accent font-bold">
                    {season}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-text-muted truncate">
                  ANALYST WORKSTATION
                </div>
              </div>
            </div>

            {/* Live Model Status Dot */}
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-none bg-background border border-border text-[9px] font-mono text-text-secondary" title="Inference Engine Active">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-accent"></span>
              </span>
              <span className="font-bold text-brand-accent">LIVE</span>
            </div>
          </div>
        </div>

        {/* Studio Navigation Links */}
        <div className="p-2">
          <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-text-muted">
            MODULES
          </div>
          <nav className="space-y-0.5 mt-0.5">
            {navItems.map(({ id, label, Icon, badge }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-mono transition-all rounded-none border ${
                    isActive
                      ? 'bg-surface-active text-text-primary border-l-2 border-l-brand-accent border-t-border border-r-border border-b-border font-bold shadow-sm'
                      : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-hover hover:border-border-subtle'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-brand-accent' : 'text-text-muted'}`} />
                    <span className="truncate">{label}</span>
                  </div>
                  {badge && (
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded-none border ${
                        isActive
                          ? 'bg-background border-brand-accent/40 text-brand-accent font-bold'
                          : 'bg-background/60 border-border text-text-muted'
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

      {/* Footer System Specs */}
      <div className="p-2.5 border-t border-border bg-surface-subtle/80 space-y-1.5 text-[9px] font-mono text-text-muted">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-text-secondary">
            <Cpu className="h-3 w-3 mr-1 text-brand-accent" />
            ENGINE
          </span>
          <span className="text-text-primary font-bold">RF + XGBOOST</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-text-secondary">
            <Radio className="h-3 w-3 mr-1 text-brand-accent" />
            POISSON xG
          </span>
          <span className="text-brand-accent font-bold">CALIBRATED</span>
        </div>
        <div className="pt-1.5 border-t border-border-subtle flex items-center justify-between text-[8px] text-text-muted">
          <span>ZERO-LEAKAGE T-1</span>
          <span className="text-text-secondary">380 FIXTURES</span>
        </div>
      </div>
    </aside>
  );
};
