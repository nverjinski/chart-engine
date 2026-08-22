import type { MarketPoint } from "@/data";
import { getXDomain } from "@/chart-core/domains";
import { createXScale, createYScale } from "@/chart-core/scales";
import type {
  TimeDomain,
  NumericDomain,
  SharedViewport,
  PanelViewport,
  PlotSize,
} from "./viewportTypes";

export function buildSharedViewport(args: {
  points: MarketPoint[];
  innerWidth: number;
  xDomain: TimeDomain | null;
}): SharedViewport {
  const { points, innerWidth, xDomain } = args;

  const domain = xDomain ?? getXDomain(points);
  const scale = createXScale(domain, [0, innerWidth]);

  return {
    xDomain: domain,
    xScale: scale,
  };
}

export function buildPanelViewport(args: {
  shared: SharedViewport;
  points: MarketPoint[];
  size: PlotSize;
  getYDomain: (visible: MarketPoint[]) => NumericDomain;
}): PanelViewport {
  const {
    points,
    shared,
    getYDomain,
    size: { width, height, margins, innerWidth, innerHeight },
  } = args;

  // Domains need a non-empty source; series should draw nothing if empty.
  const yDomain = getYDomain(points);
  const yScale = createYScale(yDomain, [innerHeight, 0]);

  return {
    xDomain: shared.xDomain,
    xScale: shared.xScale,
    yDomain,
    yScale,
    size: {
      width,
      height,
      margins,
      innerWidth,
      innerHeight,
    },
  };
}
