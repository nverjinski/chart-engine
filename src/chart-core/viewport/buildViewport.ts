import type { MarketPoint } from "@/data";
import { getXDomain, getVisibleWindow } from "@/chart-core/domains";
import { createXScale, createYScale } from "@/chart-core/scales";
import type {
  TimeDomain,
  NumericDomain,
  SharedViewport,
  PanelViewport,
} from "./viewportTypes";
import type { PlotSize } from "./viewportTypes";

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
  const window = getVisibleWindow(points, shared.xDomain);
  const ySource =
    window.startIndex === 0 && window.endIndex === points.length
      ? points
      : window.slice;
  const yDomain = getYDomain(ySource);
  const yScale = createYScale(yDomain, [innerHeight, 0]);

  console.count("buildPanelViewport");
  console.log(ySource.length, ySource === points);

  return {
    xDomain: shared.xDomain,
    xScale: shared.xScale,
    yDomain,
    yScale,
    visible: ySource,
    size: {
      width,
      height,
      margins,
      innerWidth: innerWidth,
      innerHeight: innerHeight,
    },
  };
}
