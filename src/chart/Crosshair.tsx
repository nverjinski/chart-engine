import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "@/data";

type CrosshairProps = {
  point: MarketPoint;
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  innerHeight: number;
  verticalOnly?: boolean;
  horizontalOnly?: boolean;
};

export function Crosshair({
  point,
  xScale,
  yScale,
  innerHeight,
  verticalOnly = false,
  horizontalOnly = false,
}: CrosshairProps) {
  const x = xScale(point.timestamp) ?? 0;
  const y = yScale(point.price) ?? 0;

  return (
    <g className="crosshair" pointerEvents="none">
      {!horizontalOnly && (
        <line x1={x} x2={x} y1={0} y2={innerHeight} stroke="currentColor" />
      )}
      {!verticalOnly && (
        <line
          x1={0}
          x2={xScale.range()[1]}
          y1={y}
          y2={y}
          stroke="currentColor"
        />
      )}
      {!verticalOnly && !horizontalOnly && (
        <circle cx={x} cy={y} r={3.5} fill="currentColor" />
      )}
    </g>
  );
}
