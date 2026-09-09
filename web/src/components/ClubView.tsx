import React, { useMemo, useState } from 'react';
import { ClubGameweekPoint, Fixture, StandingsRow, TeamProfile } from '../types';
import {
  Shield,
  MapPin,
  Swords,
  TrendingUp,
  Home,
  Plane,
  CalendarDays,
} from 'lucide-react';

interface ClubViewProps {
  teams: Record<string, TeamProfile>;
  clubSeries: Record<string, ClubGameweekPoint[]>;
  fixtures: Fixture[];
  standings: StandingsRow[];
  initialClub?: string;
  onOpenSimulator: (homeTeam: string, awayTeam: string) => void;
}

const parseScore = (score: string): [number, number] | null => {
  const parts = score.split('-');
  if (parts.length !== 2) return null;
  const h = Number(parts[0].trim());
  const a = Number(parts[1].trim());
  if (!Number.isFinite(h) || !Number.isFinite(a)) return null;
  return [h, a];
};

const PointsRaceChart: React.FC<{ series: ClubGameweekPoint[]; color: string; name: string }> = ({
  series,
  color,
  name,
}) => {
  const W = 760;
  const H = 220;
  const PAD_L = 34;
  const PAD_B = 22;
  const maxPts = Math.max(...series.map((p) => p.cumPoints), 1);
  const x = (gw: number) => PAD_L + ((gw - 1) / 37) * (W - PAD_L - 10);
  const y = (pts: number) => (H - PAD_B) - (pts / maxPts) * (H - PAD_B - 14);
  const line = series.map((p) => `${x(p.gw).toFixed(1)},${y(p.cumPoints).toFixed(1)}`).join(' ');
  const area = `${PAD_L},${H - PAD_B} ${line} ${x(38).toFixed(1)},${H - PAD_B}`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52" role="img" aria-label={`${name} cumulative points race`}>
          <title>{`${name} cumulative points per gameweek`}</title>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line x1={PAD_L} x2={W - 10} y1={y(maxPts * f)} y2={y(maxPts * f)} stroke="#0a534e" strokeWidth="1" />
              <text x="2" y={y(maxPts * f) + 3} fontSize="9" fill="#b2cdc4" fontFamily="monospace">
                {Math.round(maxPts * f)}
              </text>
            </g>
          ))}
          <polygon points={area} fill={color} opacity="0.14" />
          <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          {series.filter((p) => p.gw % 2 === 1 || p.gw === 38).map((p) => (
            <g key={p.gw}>
              <circle cx={x(p.gw)} cy={y(p.cumPoints)} r="3" fill={color} stroke="#021e23" strokeWidth="1">
                <title>{`GW${p.gw}: ${p.cumPoints} pts (${p.gf}-${p.ga} vs GW opponent)`}</title>
              </circle>
              {(p.gw === 1 || p.gw % 6 === 0 || p.gw === 38) && (
                <text x={x(p.gw)} y={H - 8} textAnchor="middle" fontSize="9" fill="#b2cdc4" fontFamily="monospace">
                  {p.gw}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const GoalsBarsChart: React.FC<{ series: ClubGameweekPoint[]; name: string }> = ({ series, name }) => {
  const maxG = Math.max(...series.flatMap((p) => [p.gf, p.ga]), 1);
  const W = series.length * 20 + 34;
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <svg viewBox={`0 0 ${W} 170`} className="w-full h-40" role="img" aria-label={`${name} goals for and against per gameweek`}>
          <title>{`${name} scored vs conceded per gameweek`}</title>
          {series.map((p, i) => {
            const x = 30 + i * 20;
            const gfH = (p.gf / maxG) * 130;
            const gaH = (p.ga / maxG) * 130;
            return (
              <g key={p.gw}>
                <title>{`GW${p.gw}: scored ${p.gf}, conceded ${p.ga}`}</title>
                <rect x={x} y={150 - gfH} width="8" height={gfH} fill="#25845f" opacity="0.9" />
                <rect x={x + 9} y={150 - gaH} width="8" height={gaH} fill="#8cbc93" opacity="0.85" />
                {(p.gw === 1 || p.gw % 6 === 0 || p.gw === 38) && (
                  <text x={x + 8} y="163" textAnchor="middle" fontSize="8" fill="#b2cdc4" fontFamily="monospace">
                    {p.gw}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="flex items-center space-x-3 text-[11px] font-mono text-text-muted px-1">
          <span className="flex items-center"><span className="h-2 w-2 bg-brand-primary mr-1" />Scored</span>
          <span className="flex items-center"><span className="h-2 w-2 bg-brand-accent mr-1" />Conceded</span>
        </div>
      </div>
    </div>
  );
};

export const ClubView: React.FC<ClubViewProps> = ({
  teams,
  clubSeries,
  fixtures,
  standings,
  initialClub,
  onOpenSimulator,
}) => {
  const clubNames = useMemo(
    () => Object.values(teams).sort((a, b) => a.rank - b.rank).map((t) => t.name),
    [teams],
  );
  const [club, setClub] = useState<string>(
    initialClub && teams[initialClub] ? initialClub : clubNames[0] ?? 'Arsenal',
  );
  const profile = teams[club] ?? teams[clubNames[0]];
  const series = useMemo(() => clubSeries[profile.name] ?? [], [clubSeries, profile.name]);

  const clubFixtures = useMemo(
    () =>
      fixtures
        .filter((f) => f.homeTeam === profile.name || f.awayTeam === profile.name)
        .sort((a, b) => a.gameweek - b.gameweek || a.date.localeCompare(b.date)),
    [fixtures, profile.name],
  );
  const upcoming = clubFixtures.filter((f) => f.status !== 'Played').slice(0, 5);
  const played = clubFixtures.filter((f) => f.status === 'Played').slice(-5).reverse();

  const resultFor = (f: Fixture): 'W' | 'D' | 'L' => {
    const parsed = parseScore(f.actualScore);
    if (!parsed) return 'D';
    const [h, a] = parsed;
    const isHome = f.homeTeam === profile.name;
    const gf = isHome ? h : a;
    const ga = isHome ? a : h;
    if (gf > ga) return 'W';
    if (gf < ga) return 'L';
    return 'D';
  };

  if (!profile) {
    return (
      <div className="border border-border bg-surface p-12 text-center rounded-sm">
        <p className="text-xs text-text-muted font-mono">No club data available.</p>
      </div>
    );
  }

  const standing = standings.find((s) => s.team === profile.name);

  return (
    <div className="space-y-4">
      {/* Club selector */}
      <div className="border border-border bg-surface p-3 sm:p-4 rounded-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
          <Shield className="h-4 w-4 text-brand-accent" />
          <span>Club Performance</span>
        </div>
        <select
          value={profile.name}
          onChange={(e) => setClub(e.target.value)}
          className="w-full sm:max-w-xs rounded-sm border border-border bg-background px-3 py-2 text-xs font-bold text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          aria-label="Select club"
        >
          {clubNames.map((name) => (
            <option key={name} value={name}>
              #{teams[name]?.rank ?? '-'} {name}
            </option>
          ))}
        </select>
      </div>

      {/* Hero */}
      <div className="border border-border bg-surface rounded-sm overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: profile.color }} />
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                RANK #{profile.rank} • {profile.points} PTS
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-0.5">{profile.name}</h2>
              <div className="flex items-center space-x-1.5 text-xs text-text-muted mt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{profile.stadium}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-3 font-mono text-[10px]">
                {profile.last5Form.map((r, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 flex items-center justify-center font-bold rounded-sm ${
                      r === 'W' ? 'bg-brand-primary text-white' : r === 'D' ? 'bg-slate-600 text-white' : 'bg-red-800 text-white'
                    }`}
                  >
                    {r}
                  </span>
                ))}
                <span className="text-text-muted ml-1">LAST 5</span>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-center text-xs w-full sm:w-auto">
              {[
                { label: 'WIN RATE', value: `${profile.winRate}%` },
                { label: 'GF / MATCH', value: String(profile.gfPerMatch) },
                { label: 'GA / MATCH', value: String(profile.gaPerMatch) },
                { label: 'POSSESSION', value: `${profile.possessionAvg}%` },
                { label: 'SHOTS ON TGT', value: String(profile.shotsTargetAvg) },
                { label: 'AVG REST', value: `${profile.restDaysAvg}d` },
              ].map((s) => (
                <div key={s.label} className="border border-border-subtle bg-background px-2.5 py-2 rounded-sm">
                  <div className="text-[9px] font-mono text-text-muted">{s.label}</div>
                  <div className="font-mono font-black text-text-primary mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          {typeof profile.gf === 'number' && (
            <div className="mt-3 pt-3 border-t border-border-subtle text-xs font-mono text-text-secondary flex flex-wrap gap-x-4 gap-y-1">
              <span>Record: <span className="text-text-primary font-bold">{profile.won}W-{profile.drawn}D-{profile.lost}L</span></span>
              <span>Goals: <span className="text-text-primary font-bold">{profile.gf}F / {profile.ga}A (GD {profile.gd && profile.gd > 0 ? `+${profile.gd}` : profile.gd})</span></span>
              {standing && <span>Table: <span className="text-text-primary font-bold">#{standing.rank} • {standing.points} pts</span></span>}
            </div>
          )}
        </div>
      </div>

      {/* Home / Away splits */}
      {(profile.homeSplit || profile.awaySplit) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'HOME RECORD', icon: Home, split: profile.homeSplit },
            { title: 'AWAY RECORD', icon: Plane, split: profile.awaySplit },
          ].map((card) =>
            card.split ? (
              <div key={card.title} className="border border-border bg-surface p-4 rounded-sm">
                <div className="flex items-center space-x-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted mb-2">
                  <card.icon className="h-3.5 w-3.5 text-brand-accent" />
                  <span>{card.title}</span>
                </div>
                <div className="font-mono text-sm font-black text-text-primary">
                  {card.split.w}W - {card.split.d}D - {card.split.l}L
                </div>
                <div className="text-xs font-mono text-text-secondary mt-1">
                  {card.split.gf} scored / {card.split.ga} conceded
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Points race */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
          <TrendingUp className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            CUMULATIVE POINTS RACE (BY GAMEWEEK)
          </h3>
        </div>
        {series.length > 0 ? (
          <PointsRaceChart series={series} color={profile.color === '#FFFFFF' ? '#b2cdc4' : profile.color} name={profile.name} />
        ) : (
          <p className="text-xs font-mono text-text-muted">No gameweek series available.</p>
        )}
      </div>

      {/* Goals */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
          <Swords className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            SCORED VS CONCEDED PER GAMEWEEK
          </h3>
        </div>
        {series.length > 0 ? (
          <GoalsBarsChart series={series} name={profile.name} />
        ) : (
          <p className="text-xs font-mono text-text-muted">No goal series available.</p>
        )}
      </div>

      {/* Fixtures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border bg-surface p-4 rounded-sm">
          <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
            <CalendarDays className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">NEXT 5 FIXTURES</h3>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-xs font-mono text-text-muted">Season complete — no upcoming fixtures.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((f) => {
                const isHome = f.homeTeam === profile.name;
                const opp = isHome ? f.awayTeam : f.homeTeam;
                return (
                  <button
                    key={f.id}
                    onClick={() => onOpenSimulator(f.homeTeam, f.awayTeam)}
                    className="w-full text-left border border-border-subtle bg-background p-2.5 rounded-sm hover:border-border-active transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-mono text-text-muted flex-shrink-0">GW{f.gameweek}</span>
                      <span className="font-bold text-text-primary truncate">
                        {isHome ? 'vs' : 'at'} {opp}
                      </span>
                      <span className="font-mono font-black text-text-primary flex-shrink-0">{f.predictedScore}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mt-1">
                      <span>{f.date} • {isHome ? 'HOME' : 'AWAY'}</span>
                      <span>
                        <span className="text-brand-accent font-bold">H {f.homeWinProb}%</span>
                        {' / '}
                        <span className="text-slate-300 font-bold">D {f.drawProb}%</span>
                        {' / '}
                        <span className="text-text-secondary font-bold">A {f.awayWinProb}%</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border border-border bg-surface p-4 rounded-sm">
          <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
            <Shield className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">RECENT RESULTS</h3>
          </div>
          {played.length === 0 ? (
            <p className="text-xs font-mono text-text-muted">No played matches yet this season.</p>
          ) : (
            <div className="space-y-2">
              {played.map((f) => {
                const r = resultFor(f);
                const isHome = f.homeTeam === profile.name;
                const opp = isHome ? f.awayTeam : f.homeTeam;
                return (
                  <div key={f.id} className="border border-border-subtle bg-background p-2.5 rounded-sm">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="flex items-center space-x-2 min-w-0">
                        <span className={`w-5 h-5 flex items-center justify-center font-mono text-[10px] font-bold rounded-sm flex-shrink-0 ${r === 'W' ? 'bg-brand-primary text-white' : r === 'D' ? 'bg-slate-600 text-white' : 'bg-red-800 text-white'}`}>
                          {r}
                        </span>
                        <span className="font-bold text-text-primary truncate">{isHome ? 'vs' : 'at'} {opp}</span>
                      </span>
                      <span className="font-mono font-black text-text-primary flex-shrink-0">{f.actualScore}</span>
                    </div>
                    <div className="text-[11px] font-mono text-text-muted mt-1">
                      GW{f.gameweek} • {f.date} • predicted {f.predictedScore}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
