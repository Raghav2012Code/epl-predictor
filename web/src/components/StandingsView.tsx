import React, { useState } from 'react';
import { StandingsRow } from '../types';
import { Trophy, ShieldAlert, Award, ArrowUpDown } from 'lucide-react';

interface StandingsViewProps {
  standings: StandingsRow[];
  onSelectTeam?: (teamName: string) => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  standings,
  onSelectTeam,
}) => {
  const [sortField, setSortField] = useState<keyof StandingsRow>('points');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const sortedStandings = [...standings].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof StandingsRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const champion = standings[0];
  const bestAttack = [...standings].sort((a, b) => b.gf - a.gf)[0];
  const bestDefense = [...standings].sort((a, b) => a.ga - b.ga)[0];

  return (
    <div className="space-y-4">
      {/* Key Season Callout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Projected Champion */}
        <div className="border border-border bg-surface p-4 rounded-sm">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
            <Trophy className="h-3.5 w-3.5 text-brand-accent" />
            <span>PROJECTED CHAMPIONS</span>
          </div>
          <div className="text-base font-black text-text-primary">{champion?.team}</div>
          <div className="text-xs font-mono text-text-secondary mt-1">
            {champion?.points} Pts • {champion?.won}W-{champion?.drawn}D-{champion?.lost}L • GD +{champion?.gd}
          </div>
        </div>

        {/* Top Offensive Team */}
        <div className="border border-border bg-surface p-4 rounded-sm">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
            <Award className="h-3.5 w-3.5 text-brand-accent" />
            <span>TOP OFFENSIVE SQUAD</span>
          </div>
          <div className="text-base font-black text-text-primary">{bestAttack?.team}</div>
          <div className="text-xs font-mono text-text-secondary mt-1">
            {bestAttack?.gf} Goals Scored ({(bestAttack?.gf / 38).toFixed(2)} / match)
          </div>
        </div>

        {/* Top Defensive Team */}
        <div className="border border-border bg-surface p-4 rounded-sm">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span>TOP DEFENSIVE RECORD</span>
          </div>
          <div className="text-base font-black text-text-primary">{bestDefense?.team}</div>
          <div className="text-xs font-mono text-text-secondary mt-1">
            {bestDefense?.ga} Goals Conceded ({(bestDefense?.ga / 38).toFixed(2)} / match)
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-border bg-surface rounded-sm overflow-x-auto">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-brand-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              2026/2027 PROJECTED PREMIER LEAGUE STANDINGS (380 MATCHES)
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-text-muted">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 mr-1.5" /> Champions League
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-amber-500 mr-1.5" /> Europa League
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-red-500 mr-1.5" /> Relegation
            </span>
          </div>
        </div>

        <table className="w-full min-w-[680px] text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-border bg-surface-subtle font-mono text-[11px] text-text-muted">
              <th className="py-2.5 px-3 w-12 text-center">POS</th>
              <th className="py-2.5 px-3">CLUB</th>
              <th
                onClick={() => handleSort('played')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-text-primary"
              >
                P
              </th>
              <th
                onClick={() => handleSort('won')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-text-primary"
              >
                W
              </th>
              <th
                onClick={() => handleSort('drawn')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-text-primary"
              >
                D
              </th>
              <th
                onClick={() => handleSort('lost')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-text-primary"
              >
                L
              </th>
              <th
                onClick={() => handleSort('gf')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-text-primary"
              >
                GF
              </th>
              <th
                onClick={() => handleSort('ga')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-text-primary"
              >
                GA
              </th>
              <th
                onClick={() => handleSort('gd')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-text-primary"
              >
                GD
              </th>
              <th
                onClick={() => handleSort('points')}
                className="py-2.5 px-3 text-center font-bold text-text-primary cursor-pointer hover:underline"
              >
                PTS
              </th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">FORM (LAST 5)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono text-xs">
            {sortedStandings.map((row) => {
              const isUCL = row.rank <= 4;
              const isUEL = row.rank === 5;
              const isRel = row.rank >= 18;

              return (
                <tr
                  key={row.team}
                  onClick={() => onSelectTeam && onSelectTeam(row.team)}
                  className="hover:bg-surface-hover transition-colors cursor-pointer group"
                >
                  {/* Position with qualification border bar */}
                  <td className="py-2.5 px-3 text-center font-bold text-text-secondary relative">
                    {isUCL && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                    )}
                    {isUEL && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500" />
                    )}
                    {isRel && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />
                    )}
                    {row.rank}
                  </td>

                  {/* Club Name */}
                  <td className="py-2.5 px-3 font-sans font-bold text-text-primary">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-1.5 h-3 flex-shrink-0 ring-1 ring-white/15"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="group-hover:text-brand-accent transition-colors truncate">
                        {row.team}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-center text-text-secondary">{row.played}</td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">{row.won}</td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">{row.drawn}</td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">{row.lost}</td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">{row.gf}</td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">{row.ga}</td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-text-primary bg-surface-subtle/40">
                    {row.points}
                  </td>

                  {/* Last 5 Form Pills */}
                  <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                    <div className="flex justify-end space-x-1 font-mono text-[9px]">
                      {row.last5.map((res, i) => (
                        <span
                          key={i}
                          className={`w-3.5 h-3.5 flex items-center justify-center font-bold ${
                            res === 'W'
                              ? 'bg-brand-primary text-white'
                              : res === 'D'
                              ? 'bg-slate-600 text-white'
                              : 'bg-red-800 text-white'
                          }`}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
