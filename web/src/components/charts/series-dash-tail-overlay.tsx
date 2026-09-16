"use client";

import { memo, useMemo, type RefObject } from "react";
import { DashTailStroke } from "./dash-tail-stroke";
import { findPathLengthAtX, resolveDashStartX, resolveDashTailBounds } from "./path-stroke-utils";

interface SeriesDashTailOverlayProps {
  dashFromIndex?: number;
  dashArray: string;
  data: Record<string, unknown>[];
  pathD: string | null;
  pathLength: number;
  innerWidth: number;
  innerHeight: number;
  stroke: string;
  strokeWidth: number;
  xScale: (value: Date | number) => number | undefined;
  xAccessor: (datum: Record<string, unknown>) => Date | number;
  pathRef: RefObject<SVGPathElement | null>;
}

function SeriesDashTailOverlayImpl({
  dashFromIndex,
  dashArray,
  data,
  pathD,
  pathLength,
  innerWidth,
  innerHeight,
  stroke,
  strokeWidth,
  xScale,
  xAccessor,
  pathRef,
}: SeriesDashTailOverlayProps) {
  const hasDashTail = resolveDashTailBounds(dashFromIndex, data.length);

  const dashStartX = useMemo(() => {
    if (!hasDashTail || dashFromIndex == null) {
      return 0;
    }
    return resolveDashStartX(data, dashFromIndex, xScale, xAccessor);
  }, [hasDashTail, dashFromIndex, data, xScale, xAccessor]);

  const dashStartLength = useMemo(() => {
    if (!hasDashTail || dashFromIndex == null || pathLength <= 0) {
      return 0;
    }
    return findPathLengthAtX(pathRef.current, pathLength, dashStartX);
  }, [hasDashTail, dashFromIndex, pathLength, pathRef, dashStartX]);

  if (!hasDashTail || dashFromIndex == null || pathLength <= 0) {
    return null;
  }

  return (
    <DashTailStroke
      dashArray={dashArray}
      dashStartLength={dashStartLength}
      dashStartX={dashStartX}
      innerHeight={innerHeight}
      innerWidth={innerWidth}
      pathD={pathD}
      pathLength={pathLength}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

// All props originate from the chart's stable context slice (data, xScale,
// xAccessor, …) or are mount-stable strings (gradient `url(#…)` ids). Shallow
// compare lets us skip the path-length binary search on every cursor move.
export const SeriesDashTailOverlay = memo(SeriesDashTailOverlayImpl);
