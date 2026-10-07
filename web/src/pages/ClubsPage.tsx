import React, { useMemo } from "react";
import type { EPLDataset, VenueSplit } from "../types";
import { TeamMark } from "../components/TeamMark";
import { scoreForClub } from "../lib/format";
import { upcomingFixtures } from "../lib/fixtureDates";
import { clubResultFor } from "../lib/fixtures";

const chipFor = (result: string | null) =>
  result === "Win" ? "W" : result === "Loss" ? "L" : result === "Draw" ? "D" : "-";

const SplitRow: React.FC<{ label: string; split?: VenueSplit }> = ({ label, split }) =>
  split ? (
    <tr>
      <th scope="row">{label}</th>
      <td className="num">{split.w}</td>
      <td className="num">{split.d}</td>
      <td className="num">{split.l}</td>
      <td className="num">{split.gf}</td>
      <td className="num">{split.ga}</td>
    </tr>
  ) : null;

export const ClubsPage: React.FC<{
  dataset: EPLDataset;
  selectedClub: string;
  setSelectedClub: (club: string) => void;
  onSimulate: (home: string, away: string) => void;
}> = ({ dataset, selectedClub, setSelectedClub, onSimulate }) => {
  const teams = useMemo(
    () => Object.values(dataset.teams).sort((a, b) => a.rank - b.rank),
    [dataset.teams],
  );
  const profile = dataset.teams[selectedClub] ?? teams[0];
  if (!profile)
    return (
      <div className="empty">
        <strong>No club data</strong>
        Reload the page to load the season file again.
      </div>
    );
  const clubFixtures = dataset.fixtures
    .filter(
      (fixture) =>
        fixture.homeTeam === profile.name || fixture.awayTeam === profile.name,
    )
    .sort((a, b) => a.gameweek - b.gameweek);
  const upcoming = upcomingFixtures(clubFixtures, 5);
  const recent = clubFixtures
    .filter((fixture) => fixture.status === "Played")
    .slice(-5)
    .reverse();
  const opponent = (home: string, away: string) =>
    home === profile.name ? `vs ${away}` : `at ${home}`;
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Clubs</h1>
          <p className="label page-head__sub">
            Season projection for one club, with its results and next matches.
          </p>
        </div>
        <select
          className="select club-select"
          value={profile.name}
          onChange={(event) => setSelectedClub(event.target.value)}
          aria-label="Choose a club"
        >
          {teams.map((team) => (
            <option key={team.name}>{team.name}</option>
          ))}
        </select>
      </header>

      <div className="club-picker" role="group" aria-label="Choose a club">
        {teams.map((team) => (
          <button
            key={team.name}
            type="button"
            className="club-picker__item"
            aria-pressed={team.name === profile.name}
            aria-label={team.name}
            title={team.name}
            onClick={() => setSelectedClub(team.name)}
          >
            <TeamMark team={team} />
            <span className="label">{team.short}</span>
          </button>
        ))}
      </div>

      <article className="club-hero" aria-labelledby="club-name">
        <div className="club-hero__identity">
          <TeamMark team={profile} />
          <div>
            <h2 id="club-name">{profile.name}</h2>
            <p className="label">
              {profile.stadium}. Projected position {profile.rank}, {profile.points} points.
            </p>
          </div>
        </div>
        <dl className="club-hero__kpis">
          <div>
            <dt className="label">Projected record</dt>
            <dd className="num">
              {profile.won}-{profile.drawn}-{profile.lost}
            </dd>
          </div>
          <div>
            <dt className="label">Projected goals for and against</dt>
            <dd className="num">
              {profile.gf}-{profile.ga}
            </dd>
          </div>
          <div>
            <dt className="label">Projected win rate</dt>
            <dd className="num">{profile.winRate}%</dd>
          </div>
          <div>
            <dt className="label">Average rest</dt>
            <dd className="num">{profile.restDaysAvg} days</dd>
          </div>
        </dl>
        {profile.last5Form?.length > 0 && (
          <div className="club-hero__form">
            <span className="label">Last five</span>
            <span className="form-chips" role="img" aria-label={`Last five: ${profile.last5Form.join(", ")}`}>
              {profile.last5Form.map((result, index) => (
                <span key={index} className={`form-chip form-chip--${result}`} aria-hidden="true">
                  {result}
                </span>
              ))}
            </span>
          </div>
        )}
      </article>

      <div className="club-grid">
        <section aria-labelledby="club-recent">
          <h3 id="club-recent">Recent results</h3>
          {recent.length ? (
            <ul className="rows">
              {recent.map((fixture) => {
                const result = clubResultFor(fixture, profile.name);
                const letter = chipFor(result);
                return (
                  <li className="rows__item" key={fixture.id}>
                    <span className={`form-chip form-chip--${letter}`} aria-label={result ?? "No result"}>
                      {letter}
                    </span>
                    <span className="rows__name">{opponent(fixture.homeTeam, fixture.awayTeam)}</span>
                    <span className="rows__score num">{scoreForClub(fixture.actualScore, fixture, profile.name)}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty">
              <strong>No results yet</strong>
              {profile.name} have not played a match in this dataset.
            </div>
          )}
        </section>
        <section aria-labelledby="club-next">
          <h3 id="club-next">Next matches</h3>
          {upcoming.length ? (
            <ul className="rows">
              {upcoming.map((fixture) => (
                <li key={fixture.id}>
                  <button
                    type="button"
                    className="rows__item rows__item--action"
                    onClick={() => onSimulate(fixture.homeTeam, fixture.awayTeam)}
                    aria-label={`Gameweek ${fixture.gameweek}, ${fixture.homeTeam} v ${fixture.awayTeam}, predicted score ${fixture.predictedScore}. Open in simulator.`}
                  >
                    <span className="label rows__gw">GW{fixture.gameweek}</span>
                    <span className="rows__name">{opponent(fixture.homeTeam, fixture.awayTeam)}</span>
                    <span className="rows__score rows__score--predicted num">{scoreForClub(fixture.predictedScore, fixture, profile.name)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <strong>Season complete</strong>
              {profile.name} have no matches left to forecast.
            </div>
          )}
          <p className="label rows__note">Grey scores are predicted. Select a match to open it in the simulator.</p>
        </section>
      </div>

      {(profile.homeSplit || profile.awaySplit) && (
        <section className="club-venue" aria-labelledby="club-venue">
          <h3 id="club-venue">Projected home and away</h3>
          <div className="table-scroll">
            <table className="venue">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Venue</span></th>
                  <th scope="col">W</th>
                  <th scope="col">D</th>
                  <th scope="col">L</th>
                  <th scope="col">GF</th>
                  <th scope="col">GA</th>
                </tr>
              </thead>
              <tbody>
                <SplitRow label="Home" split={profile.homeSplit} />
                <SplitRow label="Away" split={profile.awaySplit} />
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
};
