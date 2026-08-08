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
