import React, { useMemo, useState } from "react";
import type { EPLDataset } from "../types";
import { MotionSection } from "../components/Motion";
import { TeamMark } from "../components/TeamMark";

type SortKey =
  "rank" | "team" | "played" | "won" | "drawn" | "lost" | "gd" | "points";

export const StandingsPage: React.FC<{
  dataset: EPLDataset;
  onClub: (team: string) => void;
}> = ({ dataset, onClub }) => {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [ascending, setAscending] = useState(true);
  const sorted = useMemo(
    () =>
      [...dataset.standings].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const comparison =
          typeof av === "string"
            ? String(av).localeCompare(String(bv))
            : Number(av) - Number(bv);
        return ascending ? comparison : -comparison;
      }),
    [ascending, dataset.standings, sortKey],
  );
  const chooseSort = (key: SortKey) => {
    if (sortKey === key) setAscending((value) => !value);
    else {
      setSortKey(key);
      setAscending(key === "rank");
    }
  };
  const headers: Array<[SortKey, string]> = [
    ["rank", "#"],
    ["team", "Club"],
    ["played", "P"],
    ["won", "W"],
    ["drawn", "D"],
    ["lost", "L"],
    ["gd", "GD"],
    ["points", "Pts"],
  ];
  return (
    <MotionSection className="page-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Projected league table</p>
          <h1>See the full season projection.</h1>
          <p className="lede">
            Every row is a full-season projection built from the model-s
            scorelines. Browse Fixtures for official results and individual
            forecast reviews.
          </p>
        </div>
      </div>
      <div className="table-note">
        <span className="dot dot-amber" /> Full-season projection{" "}
        <span className="muted">
          Sorted by {sortKey === "rank" ? "table position" : sortKey}
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <caption className="sr-only">Premier League standings</caption>
          <thead>
            <tr>
              {headers.map(([key, label]) => (
                <th
                  key={key}
                  aria-sort={
                    sortKey === key
                      ? ascending
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button onClick={() => chooseSort(key)}>
                    {label}
                    <span aria-hidden="true">
                      {sortKey === key ? (ascending ? " ↑" : " ↓") : ""}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.team}
                onClick={() => onClub(row.team)}
                tabIndex={0}
                role="button"
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClub(row.team);
                  }
                }}
                aria-label={`Open ${row.team} club profile`}
                title={`Open ${row.team} club profile`}
              >
                <td>{row.rank}</td>
                <td>
                  <span className="club-cell">
                    <TeamMark
                      team={dataset.teams[row.team]}
                      short={row.short}
                    />
                    <strong>{row.team}</strong>
                  </span>
                </td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                <td>
                  <strong>{row.points}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MotionSection>
  );
};
