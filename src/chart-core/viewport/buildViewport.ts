import type { MarketPoint } from "@/data";
import { getXDomain, type VisibleWindow } from "@/chart-core/domains";
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
  visible: VisibleWindow<MarketPoint>;
  size: PlotSize;
  getYDomain: (visible: MarketPoint[]) => NumericDomain;
}): PanelViewport {
  const {
    points,
    shared,
    visible,
    getYDomain,
    size: { width, height, margins, innerWidth, innerHeight },
  } = args;

  // Reuse the original array when the window covers the full series.
  const isFullWindow =
    visible.startIndex === 0 && visible.endIndex === points.length;
  const windowPoints = isFullWindow ? points : visible.slice;

  // Domains need a non-empty source; series should draw nothing if empty.
  const ySource = windowPoints.length > 0 ? windowPoints : points;
  const yDomain = getYDomain(ySource);
  const yScale = createYScale(yDomain, [innerHeight, 0]);

  return {
    xDomain: shared.xDomain,
    xScale: shared.xScale,
    yDomain,
    yScale,
    visible: windowPoints,
    size: {
      width,
      height,
      margins,
      innerWidth,
      innerHeight,
    },
  };
}
