import React from "react";
import type { GameweekGoals } from "../types";

/**
 * Goals per gameweek as plain CSS bars. Recorded weeks are ink; projected
 * weeks (any unplayed match) are grey, because they sum each match's single
 * most likely score and so always read lower than real totals.
 */
export const GoalsChart: React.FC<{
  weeks: GameweekGoals[];
  recorded: ReadonlySet<number>;
}> = ({ weeks, recorded }) => {
  const peak = Math.max(10, ...weeks.map((week) => week.goals));
  const recordedCount = weeks.filter((week) => recorded.has(week.gw)).length;
  return (
    <figure className="gw-chart">
      <div
        className="gw-bars"
        role="img"
        aria-label={`Goals per gameweek. ${recordedCount} recorded ${recordedCount === 1 ? "week" : "weeks"}, ${weeks.length - recordedCount} projected. Peak ${peak} goals.`}
      >
        {weeks.map((week) => (
          <span
            key={week.gw}
            className={`gw-bars__bar${recorded.has(week.gw) ? " is-recorded" : ""}`}
            style={{ height: `${Math.max(1, (week.goals / peak) * 100)}%` }}
            title={`Gameweek ${week.gw}: ${week.goals} goals, ${recorded.has(week.gw) ? "recorded" : "projected"}`}
          />
        ))}
      </div>
      <div className="gw-ticks" aria-hidden="true">
        {weeks.map((week) => (
          <span key={week.gw} className="gw-ticks__tick">
            {week.gw === 1 || week.gw % 5 === 0 ? week.gw : ""}
          </span>
        ))}
      </div>
      <figcaption className="gw-chart__legend label">
        <span><i className="is-recorded" /> Recorded</span>
        <span><i /> Projected</span>
        <span>Gameweek number along the bottom</span>
      </figcaption>
    </figure>
  );
};
