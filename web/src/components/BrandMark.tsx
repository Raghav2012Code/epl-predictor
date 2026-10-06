import React from "react";

const trend = "16,51 24,44 32,48 41,38 49,29";

/** Shield, pitch markings and rising line. Geometry matches public/favicon.svg. */
export const BrandMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 64 72" aria-hidden="true" focusable="false">
    <path d="M32 3L58 12V36C58 52 46 63 32 69C18 63 6 52 6 36V12Z" fill="var(--ink)" />
    <g fill="none" stroke="var(--paper)" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M21 11.5H43V22H21Z" />
      <circle cx="32" cy="35" r="6.5" />
    </g>
    <polyline
      points={trend}
      fill="none"
      stroke="var(--signal)"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {trend.split(" ").map((point) => {
      const [cx, cy] = point.split(",");
      return <circle key={point} cx={cx} cy={cy} r="3.4" fill="var(--signal)" />;
    })}
  </svg>
);

export const BrandLockup: React.FC<{ season: string }> = ({ season }) => (
  <>
    <BrandMark className="brand__mark" />
    <span className="brand__text">
      <span className="brand__name">EPL Predictor</span>
      <span className="brand__season">{season}</span>
    </span>
  </>
);
