import { useMemo } from "react";
import * as d3 from "d3";
import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "../data/types";

type PriceSeriesProps = {
  points: MarketPoint[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
};

export const PriceSeries = ({ points, xScale, yScale }: PriceSeriesProps) => {
  const pathD = useMemo(() => {
    const line = d3
      .line<MarketPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.price))
      .defined((d) => Number.isFinite(d.price))
      .curve(d3.curveMonotoneX);

    return line(points) ?? "";
  }, [points, xScale, yScale]);

  return (
    <path
      className="price-series"
      d={pathD}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    />
  );
};
