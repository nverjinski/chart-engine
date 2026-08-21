import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "@/data";

export type TimeDomain = [Date, Date];
export type NumericDomain = [number, number];

export type ChartMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type PlotSize = {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margins: ChartMargins;
};

/** Shared across panels */
export type SharedViewport = {
  xDomain: TimeDomain;
  xScale: ScaleTime<number, number>;
};

/** Per panel (price vs volume) */
export type PanelViewport = SharedViewport & {
  yDomain: NumericDomain;
  yScale: ScaleLinear<number, number>;
  visible: MarketPoint[];
  size: PlotSize;
};
