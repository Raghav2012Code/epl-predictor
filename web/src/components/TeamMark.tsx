import React, { useState } from "react";
import type { TeamProfile } from "../types";

export const TeamMark: React.FC<{
  team?: TeamProfile;
  short?: string;
  badge?: string;
}> = ({ team, short, badge }) => {
  const src = badge ?? team?.badge ?? "";
  const [failedSrc, setFailedSrc] = useState("");
  if (src && failedSrc !== src)
    return (
      <img
        className="team-mark team-badge"
        src={`${import.meta.env.BASE_URL}${src}`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        draggable={false}
        onError={() => setFailedSrc(src)}
      />
    );
  return (
    <span
      className="team-mark"
      style={{ borderColor: team?.color ?? "var(--line)" }}
      aria-hidden="true"
    >
      {(short ?? team?.short ?? "FC").slice(0, 3)}
    </span>
  );
};
