import React from "react";
import type { Fixture } from "../types";
import { pct } from "../lib/format";

export const ProbabilityStrip: React.FC<{ fixture: Fixture }> = ({ fixture }) => (
  <div
    className="probability-strip"
    aria-label={`Home ${pct(fixture.homeWinProb)}, draw ${pct(fixture.drawProb)}, away ${pct(fixture.awayWinProb)}`}
  >
    <span className="prob-home" style={{ width: `${fixture.homeWinProb}%` }} />
    <span className="prob-draw" style={{ width: `${fixture.drawProb}%` }} />
    <span className="prob-away" style={{ width: `${fixture.awayWinProb}%` }} />
  </div>
);
