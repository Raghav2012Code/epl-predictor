import React from "react";

type Outcome = "home" | "draw" | "away";

export type SplitBarProps = {
  home: number;
  draw: number;
  away: number;
  /** 12px bar in lists, 20px bar in detail views. */
  size?: "list" | "detail";
  /** Position in a list; enables the staggered sweep-in on mount. */
  sweep?: number;
  className?: string;
};

const spoken = (value: number) => `${Number(value).toFixed(1)} percent`;
const shown = (value: number) => `${Number(value).toFixed(1)}%`;

/**
 * The split bar: one three-way home / draw / away bar whose segment widths are
 * the exact percentages, with scoreboard numerals under each segment. The
 * favoured outcome's number is ink; the others are ink-soft.
 */
export const SplitBar: React.FC<SplitBarProps> = ({
  home,
  draw,
  away,
  size = "list",
  sweep,
  className,
}) => {
  const values: Record<Outcome, number> = { home, draw, away };
  const favoured = (Object.keys(values) as Outcome[]).reduce((best, key) =>
    values[key] > values[best] ? key : best,
  );
  const outcomes: Outcome[] = ["home", "draw", "away"];
  const classes = [
    "split-bar",
    `split-bar--${size}`,
    sweep !== undefined ? "split-bar--sweep" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={classes}
      style={
        sweep !== undefined
          ? ({ "--sweep-index": sweep } as React.CSSProperties)
          : undefined
      }
      role="img"
      aria-label={`Home win ${spoken(home)}, draw ${spoken(draw)}, away win ${spoken(away)}`}
    >
      <div className="split-bar__track" aria-hidden="true">
        {outcomes.map((key) =>
          values[key] > 0 ? (
            <span
              key={key}
              className={`split-bar__segment split-bar__segment--${key}`}
              style={{ flexBasis: `${values[key]}%` }}
            />
          ) : null,
        )}
      </div>
      <div className="split-bar__values" aria-hidden="true">
        {outcomes.map((key) => (
          <span
            key={key}
            className={`split-bar__value split-bar__value--${key} num${key === favoured ? " is-favoured" : ""}`}
            style={{ flexGrow: values[key] }}
          >
            {shown(values[key])}
          </span>
        ))}
      </div>
    </div>
  );
};
