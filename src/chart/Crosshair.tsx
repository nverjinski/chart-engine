import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "../data/types";

type CrosshairProps = {
  point: MarketPoint;
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  innerHeight: number;
};

export function Crosshair({
  point,
  xScale,
  yScale,
  innerHeight,
}: CrosshairProps) {
  const x = xScale(point.timestamp) ?? 0;
  const y = yScale(point.price) ?? 0;

  return (
    <g className="crosshair" pointerEvents="none">
      <line x1={x} x2={x} y1={0} y2={innerHeight} stroke="currentColor" />
      <line x1={0} x2={xScale.range()[1]} y1={y} y2={y} stroke="currentColor" />
      <circle cx={x} cy={y} r={3.5} fill="currentColor" />
    </g>
  );
}
