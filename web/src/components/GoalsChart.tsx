import React from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import type { GameweekGoals } from "../types";

const margin = { top: 8, right: 4, bottom: 28, left: 32 };
const tickLabel = () => ({
  fill: "var(--ink-soft)",
  fontSize: 12,
  fontFamily: "var(--font-family)",
  textAnchor: "middle" as const,
});

/**
 * Goals per gameweek (visx). Recorded weeks are dark; projected weeks (any
 * unplayed match) are grey, because they sum each match's single most likely
 * score and so always read lower than real totals.
 */
export const GoalsChart: React.FC<{
  weeks: GameweekGoals[];
  recorded: ReadonlySet<number>;
}> = ({ weeks, recorded }) => {
  const recordedCount = weeks.filter((week) => recorded.has(week.gw)).length;
  return (
    <figure className="gw-chart">
      <ParentSize debounceTime={50} parentSizeStyles={{ width: "100%", height: 260 }}>
        {({ width }) => {
          const height = 260;
          if (width < 10) return <svg height={height} />;
          const innerWidth = width - margin.left - margin.right;
          const innerHeight = height - margin.top - margin.bottom;
          const x = scaleBand({ domain: weeks.map((week) => week.gw), range: [0, innerWidth], padding: 0.15 });
          const y = scaleLinear({
            domain: [0, Math.max(10, ...weeks.map((week) => week.goals))],
            range: [innerHeight, 0],
            nice: true,
          });
          return (
            <svg
              width={width}
              height={height}
              role="img"
              aria-label={`Goals per gameweek. ${recordedCount} recorded ${recordedCount === 1 ? "week" : "weeks"}, ${weeks.length - recordedCount} projected.`}
            >
              <Group left={margin.left} top={margin.top}>
                <GridRows scale={y} width={innerWidth} numTicks={4} stroke="var(--line)" />
                {weeks.map((week) => (
                  <Bar
                    key={week.gw}
                    x={x(week.gw) ?? 0}
                    y={y(week.goals)}
                    width={x.bandwidth()}
                    height={innerHeight - y(week.goals)}
                    fill={recorded.has(week.gw) ? "var(--ink)" : "var(--draw)"}
                  >
                    <title>{`Gameweek ${week.gw}: ${week.goals} goals, ${recorded.has(week.gw) ? "recorded" : "projected"}`}</title>
                  </Bar>
                ))}
                <AxisLeft
                  scale={y}
                  numTicks={4}
                  hideAxisLine
                  hideTicks
                  tickLabelProps={() => ({ ...tickLabel(), textAnchor: "end" as const, dx: -4, dy: 4 })}
                />
                <AxisBottom
                  scale={x}
                  top={innerHeight}
                  tickValues={weeks.map((week) => week.gw).filter((gw) => gw === 1 || gw % 5 === 0)}
                  stroke="var(--ink-soft)"
                  hideTicks
                  tickLabelProps={tickLabel}
                />
              </Group>
            </svg>
          );
        }}
      </ParentSize>
      <figcaption className="gw-chart__legend label">
        <span><i className="is-recorded" /> Recorded</span>
        <span><i /> Projected</span>
        <span>Gameweek number along the bottom</span>
      </figcaption>
    </figure>
  );
};
