import React, { useMemo } from "react";
import type { EPLDataset } from "../types";
import { MotionSection } from "../components/Motion";
import { TeamMark } from "../components/TeamMark";
import { resultTone } from "../lib/format";
import { clubResultFor } from "../lib/fixtures";

export const ClubsPage: React.FC<{
  dataset: EPLDataset;
  selectedClub: string;
  setSelectedClub: (club: string) => void;
  onSimulate: (home: string, away: string) => void;
}> = ({ dataset, selectedClub, setSelectedClub, onSimulate }) => {
  const names = useMemo(
    () =>
      Object.values(dataset.teams)
        .sort((a, b) => a.rank - b.rank)
        .map((team) => team.name),
    [dataset.teams],
  );
  const profile = dataset.teams[selectedClub] ?? dataset.teams[names[0]];
  if (!profile)
    return <div className="empty-state">No club data available.</div>;
  const clubFixtures = dataset.fixtures
    .filter(
      (fixture) =>
        fixture.homeTeam === profile.name || fixture.awayTeam === profile.name,
    )
    .sort((a, b) => a.gameweek - b.gameweek);
  const upcoming = clubFixtures
    .filter((fixture) => fixture.status !== "Played")
    .slice(0, 5);
  const recent = clubFixtures
    .filter((fixture) => fixture.status === "Played")
    .slice(-5)
    .reverse();
  return (
    <MotionSection className="page-stack clubs-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Club profile</p>
          <h1>Follow one club through the season.</h1>
        </div>
        <select
          className="compact-select"
          value={profile.name}
          onChange={(event) => setSelectedClub(event.target.value)}
          aria-label="Select a club"
        >
          {names.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>
      <article className="club-hero" style={{ borderTopColor: profile.color }}>
        <div className="club-identity">
          <TeamMark team={profile} />
          <div>
            <p className="eyebrow">
              #{profile.rank} · {profile.points} points
            </p>
            <h2>{profile.name}</h2>
            <p className="muted">{profile.stadium}</p>
          </div>
        </div>
        <div className="club-kpis">
          <div>
            <span>Record</span>
            <strong>
              {profile.won}–{profile.drawn}–{profile.lost}
            </strong>
          </div>
          <div>
            <span>Goals</span>
            <strong>
              {profile.gf}–{profile.ga}
            </strong>
          </div>
          <div>
            <span>Win rate</span>
            <strong>{profile.winRate}%</strong>
          </div>
          <div>
            <span>Avg rest</span>
            <strong>{profile.restDaysAvg}d</strong>
          </div>
        </div>
      </article>
      <div className="two-column">
        <div className="content-card">
          <div className="section-heading small">
            <h2>Recent results</h2>
            <span className="muted">Official</span>
          </div>
          {recent.length ? (
            recent.map((fixture) => (
              <div className="mini-fixture" key={fixture.id}>
                <span
                  className={`result-badge ${resultTone(clubResultFor(fixture, profile.name))}`}
                >
                  {clubResultFor(fixture, profile.name)?.[0] ?? "—"}
                </span>
                <span>
                  {fixture.homeTeam === profile.name ? "vs" : "@"}{" "}
                  {fixture.homeTeam === profile.name
                    ? fixture.awayTeam
                    : fixture.homeTeam}
                </span>
                <strong>{fixture.actualScore}</strong>
              </div>
            ))
          ) : (
            <p className="muted">No completed fixtures.</p>
          )}
        </div>
        <div className="content-card">
          <div className="section-heading small">
            <h2>Next fixtures</h2>
            <span className="muted">Model score</span>
          </div>
          {upcoming.length ? (
            upcoming.map((fixture) => (
              <button
                className="mini-fixture interactive"
                key={fixture.id}
                onClick={() => onSimulate(fixture.homeTeam, fixture.awayTeam)}
              >
                <span className="muted">GW{fixture.gameweek}</span>
                <span>
                  {fixture.homeTeam === profile.name ? "vs" : "@"}{" "}
                  {fixture.homeTeam === profile.name
                    ? fixture.awayTeam
                    : fixture.homeTeam}
                </span>
                <strong>{fixture.predictedScore}</strong>
              </button>
            ))
          ) : (
            <p className="muted">Season complete.</p>
          )}
        </div>
      </div>
    </MotionSection>
  );
};
