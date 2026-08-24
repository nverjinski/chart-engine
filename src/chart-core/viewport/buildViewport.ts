import { createXScale, createYScale } from "@/chart-core/scales";
import type {
  TimeDomain,
  NumericDomain,
  SharedViewport,
  PanelViewport,
  PlotSize,
} from "./viewportTypes";

export function buildSharedViewport(args: {
  xDomain: TimeDomain;
  innerWidth: number;
}): SharedViewport {
  const { innerWidth, xDomain } = args;

  const scale = createXScale(xDomain, [0, innerWidth]);

  return {
    xDomain,
    xScale: scale,
  };
}

export function buildPanelViewport(args: {
  shared: SharedViewport;
  size: PlotSize;
  yDomain: NumericDomain;
}): PanelViewport {
  const { shared, size, yDomain } = args;
  const { width, height, margins, innerWidth, innerHeight } = size;

  const yScale = createYScale(yDomain, [innerHeight, 0], { nice: false });

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
