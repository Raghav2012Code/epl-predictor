import React from "react";
import type { FormResult } from "../lib/fixtures";

const words: Record<FormResult, string> = { W: "won", D: "drew", L: "lost" };

/** Results as W/D/L chips, oldest first; says so when there are none yet. */
export const FormChips: React.FC<{ form: FormResult[]; empty?: string }> = ({
  form,
  empty = "No results yet",
}) =>
  form.length ? (
    <span
      className="form-chips"
      role="img"
      aria-label={`Last ${form.length === 1 ? "result" : `${form.length} results`}, oldest first: ${form.map((result) => words[result]).join(", ")}`}
    >
      {form.map((result, index) => (
        <span key={index} className={`form-chip form-chip--${result}`} aria-hidden="true">
          {result}
        </span>
      ))}
    </span>
  ) : (
    <span className="label">{empty}</span>
  );
