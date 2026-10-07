import React from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar, Line, LinePath } from "@visx/shape";
import type { ModelEvaluation } from "../types";

const OUTCOMES = ["Away", "Draw", "Home"];
const OUTCOME_TITLES = ["Away win", "Draw", "Home win"];

/** Models read as a ramp: the production model is ink, benchmarks lighter. */
const modelColor = (name: string, production: string, index: number) =>
  name === production ? "var(--ink)" : ["var(--draw)", "var(--ink-soft)"][index % 2];

const axisLabel = () => ({
  fill: "var(--ink-soft)",
  fontSize: 12,
  fontFamily: "var(--font-family)",
  textAnchor: "middle" as const,
});
const axisLabelLeft = () => ({ ...axisLabel(), textAnchor: "end" as const, dx: -4, dy: 4 });

// Right margin leaves room for the centred "100%" tick at the axis end.
const margin = { top: 8, right: 18, bottom: 28, left: 36 };

const Legend: React.FC<{ items: Array<{ label: string; color: string }> }> = ({ items }) => (
  <p className="eval-legend label">
    {items.map((item) => (
      <span key={item.label}>
        <i style={{ background: item.color }} /> {item.label}
      </span>
    ))}
  </p>
);

/** Row-normalised confusion matrices as plain grids, one per model. */
export const ConfusionMatrices: React.FC<{ evaluation: ModelEvaluation; production: string }> = ({
  evaluation,
  production,
}) => (
  <div className="eval-multiples">
    {Object.entries(evaluation.confusion).map(([name, rows]) => (
      <figure key={name} className="confusion">
        <figcaption>
          {name}
          {name === production && <span className="tag">Production</span>}
        </figcaption>
        <table>
          <caption className="sr-only">
            {name}: actual outcome by row, predicted outcome by column, share of the row and match count.
          </caption>
          <thead>
            <tr>
              <td />
              {OUTCOMES.map((outcome) => (
                <th key={outcome} scope="col" className="label">
                  {outcome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, actual) => {
              const total = Math.max(1, row.reduce((sum, value) => sum + value, 0));
              return (
                <tr key={OUTCOMES[actual]}>
                  <th scope="row" className="label">
                    {OUTCOMES[actual]}
                  </th>
                  {row.map((count, predicted) => {
                    const share = Math.round((count / total) * 100);
                    return (
                      <td
                        key={OUTCOMES[predicted]}
                        className={share > 50 ? "is-dark" : undefined}
                        style={{ background: `color-mix(in srgb, var(--ink) ${share}%, var(--paper))` }}
                      >
                        <strong className="num">{share}%</strong>
                        <span>{count}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </figure>
    ))}
    <p className="label eval-note">
      Rows are the actual result, columns the model's call. The diagonal is correct.
    </p>
  </div>
);

/** Predicted probability against how often the outcome happened, per outcome. */
export const ReliabilityCurves: React.FC<{ evaluation: ModelEvaluation; production: string }> = ({
  evaluation,
  production,
}) => {
  const models = Object.keys(evaluation.reliability);
  return (
    <>
      <div className="eval-multiples">
        {OUTCOME_TITLES.map((title, outcome) => (
          <figure key={title}>
            <figcaption>{title}</figcaption>
            <ParentSize debounceTime={50} parentSizeStyles={{ width: "100%", height: 220 }}>
              {({ width }) => {
                const height = 220;
                if (width < 10) return <svg height={height} />;
                const innerWidth = width - margin.left - margin.right;
                const innerHeight = height - margin.top - margin.bottom;
                const x = scaleLinear({ domain: [0, 1], range: [0, innerWidth] });
                const y = scaleLinear({ domain: [0, 1], range: [innerHeight, 0] });
                return (
                  <svg
                    width={width}
                    height={height}
                    role="img"
                    aria-label={`${title}: observed frequency against predicted probability for ${models.join(", ")}. Points on the dashed diagonal are perfectly calibrated.`}
                  >
                    <Group left={margin.left} top={margin.top}>
                      <GridRows scale={y} width={innerWidth} tickValues={[0, 0.25, 0.5, 0.75, 1]} stroke="var(--line)" />
                      <GridColumns scale={x} height={innerHeight} tickValues={[0, 0.25, 0.5, 0.75, 1]} stroke="var(--line)" />
                      <Line
                        from={{ x: x(0), y: y(0) }}
                        to={{ x: x(1), y: y(1) }}
                        stroke="var(--draw)"
                        strokeDasharray="4 4"
                      />
                      {models.map((name, index) => {
                        const points = evaluation.reliability[name][outcome] ?? [];
                        const color = modelColor(name, production, index);
                        return (
                          <g key={name}>
                            <LinePath
                              data={points}
                              x={(point) => x(point.predicted)}
                              y={(point) => y(point.observed)}
                              stroke={color}
                              strokeWidth={name === production ? 2.5 : 1.75}
                            />
                            {points.map((point) => (
                              <circle
                                key={point.predicted}
                                cx={x(point.predicted)}
                                cy={y(point.observed)}
                                r={3}
                                fill={color}
                              >
                                <title>
                                  {`${name}: predicted ${Math.round(point.predicted * 100)}%, happened ${Math.round(point.observed * 100)}% of ${point.matches} matches`}
                                </title>
                              </circle>
                            ))}
                          </g>
                        );
                      })}
                      <AxisLeft
                        scale={y}
                        tickValues={[0, 0.5, 1]}
                        tickFormat={(value) => `${Math.round(Number(value) * 100)}%`}
                        hideAxisLine
                        hideTicks
                        tickLabelProps={axisLabelLeft}
                      />
                      <AxisBottom
                        scale={x}
                        top={innerHeight}
                        tickValues={[0, 0.5, 1]}
                        tickFormat={(value) => `${Math.round(Number(value) * 100)}%`}
                        stroke="var(--ink-soft)"
                        hideTicks
                        tickLabelProps={axisLabel}
                      />
                    </Group>
                  </svg>
                );
              }}
            </ParentSize>
          </figure>
        ))}
      </div>
      <Legend
        items={models.map((name, index) => ({ label: name, color: modelColor(name, production, index) }))}
      />
      <p className="label eval-note">
        Across: the probability the model gave. Up: how often that outcome happened. On the dashed line, a
        70% call comes true 70% of the time.
      </p>
    </>
  );
};

const GroupedBars: React.FC<{
  title: string;
  categories: number[];
  series: Array<{ label: string; values: number[]; color: string }>;
  formatCategory: (value: number) => string;
}> = ({ title, categories, series, formatCategory }) => (
  <figure>
    <figcaption>{title}</figcaption>
    <ParentSize debounceTime={50} parentSizeStyles={{ width: "100%", height: 240 }}>
      {({ width }) => {
        const height = 240;
        if (width < 10) return <svg height={height} />;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const peak = Math.max(1, ...series.flatMap((entry) => entry.values));
        const x = scaleBand({ domain: categories.map(String), range: [0, innerWidth], padding: 0.2 });
        const inner = scaleBand({
          domain: series.map((entry) => entry.label),
          range: [0, x.bandwidth()],
          padding: 0.08,
        });
        const y = scaleLinear({ domain: [0, peak], range: [innerHeight, 0], nice: true });
        return (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${title}. ${series
              .map((entry) => `${entry.label}: ${entry.values.map((value, i) => `${formatCategory(categories[i])} ${value}`).join(", ")}`)
              .join(". ")}.`}
          >
            <Group left={margin.left} top={margin.top}>
              <GridRows scale={y} width={innerWidth} numTicks={4} stroke="var(--line)" />
              {categories.map((category, index) => (
                <Group key={category} left={x(String(category)) ?? 0}>
                  {series.map((entry) => {
                    const value = entry.values[index] ?? 0;
                    return (
                      <Bar
                        key={entry.label}
                        x={inner(entry.label) ?? 0}
                        y={y(value)}
                        width={inner.bandwidth()}
                        height={innerHeight - y(value)}
                        fill={entry.color}
                      >
                        <title>{`${entry.label}, ${formatCategory(category)}: ${value}`}</title>
                      </Bar>
                    );
                  })}
                </Group>
              ))}
              <AxisLeft scale={y} numTicks={4} hideAxisLine hideTicks tickLabelProps={axisLabelLeft} />
              <AxisBottom
                scale={x}
                top={innerHeight}
                tickFormat={(value) => formatCategory(Number(value))}
                stroke="var(--ink-soft)"
                hideTicks
                tickLabelProps={axisLabel}
              />
            </Group>
          </svg>
        );
      }}
    </ParentSize>
    <Legend items={series.map((entry) => ({ label: entry.label, color: entry.color }))} />
  </figure>
);

/** Goal error for the production model: residuals and the shape of predicted scores. */
export const GoalErrorCharts: React.FC<{ evaluation: ModelEvaluation }> = ({ evaluation }) => {
  const goals = evaluation.goalError;
  return (
    <div className="eval-multiples eval-multiples--2">
      <GroupedBars
        title="Prediction error, predicted minus actual"
        categories={goals.residuals}
        formatCategory={(value) => (value > 0 ? `+${value}` : `${value}`)}
        series={[
          { label: "Home goals", values: goals.home, color: "var(--home)" },
          { label: "Away goals", values: goals.away, color: "var(--away)" },
        ]}
      />
      <GroupedBars
        title="Goals per team in a match"
        categories={goals.goals}
        formatCategory={(value) => `${value}`}
        series={[
          { label: "Actual", values: goals.actual, color: "var(--ink)" },
          { label: "Predicted", values: goals.predicted, color: "var(--draw)" },
        ]}
      />
    </div>
  );
};
