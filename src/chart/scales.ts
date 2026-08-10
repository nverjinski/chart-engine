import * as d3 from "d3";
import type { MarketPoint } from "../data/types";

export type ChartMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const PRICE_MARGINS: ChartMargins = {
  top: 16,
  right: 16,
  bottom: 28,
  left: 56,
};

export const VOLUME_MARGINS: ChartMargins = {
  top: 8,
  right: 16,
  bottom: 24,
  left: 56,
};

export function getInnerSize(
  width: number,
  height: number,
  margins: ChartMargins,
) {
  return {
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - margins.top - margins.bottom,
  };
}

export function createXScale(points: MarketPoint[], innerWidth: number) {
  const [min, max] = d3.extent(points, (d) => d.timestamp);

  if (min === undefined || max === undefined) {
    throw new Error("Cannot create scale from empty data");
  }

  return d3.scaleTime().domain([min, max]).range([0, innerWidth]);
}

export function createYScale(points: MarketPoint[], innerHeight: number) {
  const [min, max] = d3.extent(points, (d) => d.price);

  if (min === undefined || max === undefined) {
    throw new Error("Cannot create scale from empty data");
  }

  const pad = (max - min) * 0.05 || 1;

  return d3
    .scaleLinear()
    .domain([min - pad, max + pad])
    .nice()
    .range([innerHeight, 0]);
}

export function createVolumeScale(points: MarketPoint[], innerHeight: number) {
  const max = d3.max(points, (d) => d.volume) ?? 0;
  return d3
    .scaleLinear()
    .domain([0, max * 1.05 || 1])
    .nice()
    .range([innerHeight, 0]);
}

export function createYScaleForDomain(
  points: MarketPoint[],
  xDomain: [Date, Date],
  innerHeight: number,
) {
  const [x0, x1] = xDomain;
  const visible = points.filter((d) => d.timestamp >= x0 && d.timestamp <= x1);
  const source = visible.length > 0 ? visible : points;
  return createYScale(source, innerHeight);
}

export function createVolumeYScaleForDomain(
  points: MarketPoint[],
  xDomain: [Date, Date],
  innerHeight: number,
) {
  const [x0, x1] = xDomain;
  const visible = points.filter((d) => d.timestamp >= x0 && d.timestamp <= x1);
  const source = visible.length > 0 ? visible : points;
  return createVolumeScale(source, innerHeight);
}
