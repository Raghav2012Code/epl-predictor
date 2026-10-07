import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { EPLDataset } from "../types";
import { TeamMark } from "../components/TeamMark";
import { FormChips } from "../components/FormChips";
import { recentForm } from "../lib/fixtures";

type Zone = "cl" | "europe" | "relegation";

/** Usual end-of-season places: top four to the Champions League, next two to Europe, bottom three down. */
const zoneFor = (rank: number, clubs: number): Zone | null =>
  rank <= 4 ? "cl" : rank <= 6 ? "europe" : rank > clubs - 3 ? "relegation" : null;

const zoneNames: Record<Zone, string> = {
  cl: "Champions League places",
  europe: "Europa League and Conference League places",
  relegation: "Relegation",
};

type SortKey =
  "rank" | "team" | "played" | "won" | "drawn" | "lost" | "gd" | "points";

const headers: Array<{ key: SortKey; label: string; name: string; optional?: boolean }> = [
  { key: "rank", label: "#", name: "Position" },
  { key: "team", label: "Club", name: "Club" },
  { key: "played", label: "P", name: "Played" },
  { key: "won", label: "W", name: "Won", optional: true },
  { key: "drawn", label: "D", name: "Drawn", optional: true },
  { key: "lost", label: "L", name: "Lost", optional: true },
  { key: "gd", label: "GD", name: "Goal difference" },
  { key: "points", label: "Pts", name: "Points" },
];

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
      setAscending(key === "rank" || key === "team");
    }
  };
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Projected table</h1>
          <p className="label page-head__sub">
            A full-season projection built from the model's predicted scores.
            Official results are in Fixtures. Select a club to open its profile.
          </p>
        </div>
      </header>
      <div className="table-scroll">
        <table className="league">
          <caption className="sr-only">
            Projected Premier League table, sorted by{" "}
            {headers.find((header) => header.key === sortKey)?.name.toLowerCase()}
          </caption>
          <thead>
            <tr>
              {headers.map(({ key, label, name, optional }) => (
                <th
                  key={key}
                  scope="col"
                  className={`league__${key}${optional ? " is-optional" : ""}`}
                  aria-sort={
                    sortKey === key ? (ascending ? "ascending" : "descending") : "none"
                  }
                >
                  <button
                    type="button"
                    className="league__sort"
                    onClick={() => chooseSort(key)}
                    aria-label={`Sort by ${name.toLowerCase()}`}
                  >
                    {label}
                    {sortKey === key &&
                      (ascending ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      ))}
                  </button>
                </th>
              ))}
              <th scope="col" className="league__form is-optional">
                <span className="label">Form</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.team}
                className={zoneFor(row.rank, sorted.length) ? `zone zone--${zoneFor(row.rank, sorted.length)}` : undefined}
                onClick={() => onClub(row.team)}
              >
                <td className="league__rank num">
                  {row.rank}
                  {zoneFor(row.rank, sorted.length) && (
                    <span className="sr-only">, {zoneNames[zoneFor(row.rank, sorted.length) as Zone]}</span>
                  )}
                </td>
                <td className="league__team">
                  <button
                    type="button"
                    className="league__club"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClub(row.team);
                    }}
                    aria-label={`${row.team}, open club profile`}
                  >
                    <TeamMark team={dataset.teams[row.team]} short={row.short} badge={row.badge} />
                    {row.team}
                  </button>
                </td>
                <td className="num">{row.played}</td>
                <td className="num is-optional">{row.won}</td>
                <td className="num is-optional">{row.drawn}</td>
                <td className="num is-optional">{row.lost}</td>
                <td className="num">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                <td className="league__points num">{row.points}</td>
                <td className="league__form is-optional">
                  <FormChips form={recentForm(dataset.fixtures, row.team)} empty="No results" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="zone-key label" aria-label="Table key">
        {(Object.keys(zoneNames) as Zone[]).map((zone) => (
          <li key={zone}>
            <i className={`zone-key__swatch zone--${zone}`} aria-hidden="true" />
            {zoneNames[zone]}
          </li>
        ))}
        <li>Form is official results only, oldest first.</li>
      </ul>
    </>
  );
};
