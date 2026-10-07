import React from "react";
import type { GameweekGoals } from "../types";

/**
 * Goals per gameweek as plain bars. Recorded weeks are dark; projected weeks
 * (any unplayed match) are grey, because they sum each match's single most
 * likely score and so always read lower than real totals.
 */
export const GoalsChart: React.FC<{
  weeks: GameweekGoals[];
  recorded: ReadonlySet<number>;
}> = ({ weeks, recorded }) => {
  const peak = Math.max(10, ...weeks.map((week) => week.goals));
  const top = Math.ceil(peak / 10) * 10;
  const ticks = Array.from({ length: top / 10 + 1 }, (_, index) => index * 10);
  const recordedCount = weeks.filter((week) => recorded.has(week.gw)).length;
  return (
    <figure className="gw-chart">
      <div
        className="gw-chart__plot"
        role="img"
        aria-label={`Goals per gameweek. ${recordedCount} recorded ${recordedCount === 1 ? "week" : "weeks"}, ${weeks.length - recordedCount} projected. Peak ${peak} goals.`}
      >
        <div className="gw-chart__grid" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} style={{ bottom: `${(tick / top) * 100}%` }}>
              {tick}
            </span>
          ))}
        </div>
        <ol className="gw-chart__bars">
          {weeks.map((week) => (
            <li
              key={week.gw}
              className={recorded.has(week.gw) ? "is-recorded" : undefined}
              style={{ height: `${(week.goals / top) * 100}%` }}
              title={`Gameweek ${week.gw}: ${week.goals} goals, ${recorded.has(week.gw) ? "recorded" : "projected"}`}
            />
          ))}
        </ol>
      </div>
      <div className="gw-chart__axis" aria-hidden="true">
        {weeks.map((week) => (
          <span key={week.gw}>{week.gw === 1 || week.gw % 5 === 0 ? week.gw : ""}</span>
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
