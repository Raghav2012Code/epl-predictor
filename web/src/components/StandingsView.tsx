import React, { useState } from 'react';
import { ClubGameweekPoint, StandingsRow } from '../types';
import { Trophy, ShieldAlert, Award, ArrowUpDown } from 'lucide-react';

interface StandingsViewProps {
  standings: StandingsRow[];
  clubSeries?: Record<string, ClubGameweekPoint[]>;
  onSelectTeam?: (teamName: string) => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  standings,
  clubSeries,
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
            <ShieldAlert className="h-3.5 w-3.5 text-text-secondary" />
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
              <span className="w-2 h-2 bg-white mr-1.5" /> Champions League
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-zinc-500 mr-1.5" /> Europa League
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-zinc-700 mr-1.5" /> Relegation
            </span>
          </div>
        </div>

        <table className="w-full min-w-[680px] text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-border bg-surface-subtle font-mono text-[10px] text-text-muted select-none uppercase">
              <th className="py-2 px-2.5 w-10 text-center">POS</th>
              <th className="py-2 px-3">CLUB</th>
              <th
                onClick={() => handleSort('played')}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-text-primary"
              >
                P
              </th>
              <th
                onClick={() => handleSort('won')}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-text-primary"
              >
                W
              </th>
              <th
                onClick={() => handleSort('drawn')}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-text-primary"
              >
                D
              </th>
              <th
                onClick={() => handleSort('lost')}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-text-primary"
              >
                L
              </th>
              <th
                onClick={() => handleSort('gf')}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-text-primary hidden sm:table-cell"
              >
                GF
              </th>
              <th
                onClick={() => handleSort('ga')}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-text-primary hidden sm:table-cell"
              >
                GA
              </th>
              <th
                onClick={() => handleSort('gd')}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-text-primary"
              >
                GD
              </th>
              <th
                onClick={() => handleSort('points')}
                className="py-2 px-3 text-center cursor-pointer hover:text-brand-accent text-brand-accent font-bold"
              >
                PTS
              </th>
              <th className="py-2 px-3 text-center hidden md:table-cell">TRAJECTORY</th>
              <th className="py-2 px-3 text-right hidden lg:table-cell">FORM (LAST 5)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono text-xs">
            {sortedStandings.map((row) => {
              const isUCL = row.rank <= 4;
              const isUEL = row.rank === 5;
              const isRel = row.rank >= 18;

              // Real cumulative-points trajectory from exported clubSeries.
              // Falls back to a flat placeholder only when series is missing.
              const series = clubSeries?.[row.team];
              const maxSeriesPts = Math.max(1, ...(series?.map((p) => p.cumPoints) ?? [row.points]));
              const toXY = (gw: number, pts: number): string => {
                const x = (gw / 38) * 80;
                const y = Math.max(2, 16 - (pts / maxSeriesPts) * 14);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              };
              const sparkPoints = series && series.length > 1
                ? series.map((p) => toXY(p.gw, p.cumPoints)).join(' ')
                : `0,16 80,${Math.max(2, 16 - (row.points / 100) * 14).toFixed(1)}`;
              const yEnd = series && series.length
                ? Math.max(2, 16 - ((series[series.length - 1].cumPoints / maxSeriesPts) * 14))
                : Math.max(2, 16 - (row.points / 100) * 14);
              const strokeColor = isUCL ? '#ffffff' : isRel ? '#71717a' : '#a1a1aa';

              return (
                <tr
                  key={row.team}
                  onClick={() => onSelectTeam && onSelectTeam(row.team)}
                  className={`group transition-colors cursor-pointer ${
                    isUCL
                      ? 'border-l-2 border-l-white bg-surface-subtle hover:bg-surface-hover'
                      : isUEL
                      ? 'border-l-2 border-l-zinc-500 bg-surface-subtle/60 hover:bg-surface-hover'
                      : isRel
                      ? 'border-l-2 border-l-zinc-700 bg-surface-subtle/30 hover:bg-surface-hover'
                      : 'border-l-2 border-l-transparent hover:bg-surface-hover'
                  }`}
                >
                  {/* Position */}
                  <td className="py-2 px-2.5 text-center font-bold text-text-secondary text-xs tabular-nums">
                    {row.rank}
                  </td>

                  {/* Club Name */}
                  <td className="py-2 px-3 font-sans font-bold text-text-primary">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-1.5 h-3.5 flex-shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="group-hover:text-brand-accent transition-colors truncate">
                        {row.team}
                      </span>
                    </div>
                  </td>

                  <td className="py-2 px-2.5 text-center text-text-secondary tabular-nums">{row.played}</td>
                  <td className="py-2 px-2.5 text-center text-text-secondary tabular-nums">{row.won}</td>
                  <td className="py-2 px-2.5 text-center text-text-secondary tabular-nums">{row.drawn}</td>
                  <td className="py-2 px-2.5 text-center text-text-secondary tabular-nums">{row.lost}</td>
                  <td className="py-2 px-2.5 text-center text-text-muted tabular-nums hidden sm:table-cell">{row.gf}</td>
                  <td className="py-2 px-2.5 text-center text-text-muted tabular-nums hidden sm:table-cell">{row.ga}</td>

                  {/* Color-coded Goal Difference */}
                  <td className="py-2 px-2.5 text-center font-bold tabular-nums">
                    {row.gd > 0 ? (
                      <span className="text-white font-bold">+{row.gd}</span>
                    ) : row.gd < 0 ? (
                      <span className="text-zinc-400 font-bold">{row.gd}</span>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>

                  {/* Points */}
                  <td className="py-2 px-3 text-center font-black text-text-primary bg-surface-subtle/50 tabular-nums">
                    <span className="px-1.5 py-0.5 rounded-none bg-background border border-border">
                      {row.points}
                    </span>
                  </td>

                  {/* Inline 38-GW Trajectory Sparkline (real cumulative points) */}
                  <td className="py-2 px-3 text-center hidden md:table-cell">
                    <svg viewBox="0 0 80 18" className="w-20 h-3.5 inline-block" role="img" aria-label={`${row.team} trajectory`}>
                      <polyline
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={sparkPoints}
                      />
                      <circle cx="80" cy={yEnd} r="2" fill={strokeColor} />
                    </svg>
                  </td>

                  {/* Last 5 Form Micro-Pills */}
                  <td className="py-2 px-3 text-right hidden lg:table-cell">
                    <div className="flex justify-end space-x-1 font-mono text-[9px]">
                      {row.last5.map((res, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 flex items-center justify-center font-bold rounded-none border ${
                            res === 'W'
                              ? 'bg-white text-black border-white'
                              : res === 'D'
                              ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              : 'bg-zinc-950 text-zinc-500 border-zinc-800'
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
