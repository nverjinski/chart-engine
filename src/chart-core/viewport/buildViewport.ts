import type { MarketPoint } from "@/data/types";
import { getXDomain, getVisibleWindow } from "@/chart-core/domains";
import { createXScale, createYScale } from "@/chart-core/scales";
import type {
  TimeDomain,
  NumericDomain,
  SharedViewport,
  PanelViewport,
} from "./viewportTypes";
import type { ChartMargins } from "./viewportTypes";
import { getInnerSize } from "./layout";

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
  width: number;
  height: number;
  margins: ChartMargins;
  getYDomain: (visible: MarketPoint[]) => NumericDomain;
}): PanelViewport {
  const { points, shared, getYDomain, width, height, margins } = args;
  const { slice: visible } = getVisibleWindow(points, shared.xDomain);
  const ySource = visible.length ? visible : points;
  const yDomain = getYDomain(ySource);

  const inner = getInnerSize(width, height, margins);

  const yScale = createYScale(yDomain, [inner.innerHeight, 0]);

  return {
    xDomain: shared.xDomain,
    xScale: shared.xScale,
    yDomain,
    yScale,
    size: {
      width,
      height,
      margins,
      innerWidth: inner.innerWidth,
      innerHeight: inner.innerHeight,
    },
  };
}
