import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "../data/types";
import { formatPrice } from "../chart-core/formatting/formatPrice";

type TooltipProps = {
  point: MarketPoint;
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  innerWidth: number;
};

export function Tooltip({ point, xScale, yScale, innerWidth }: TooltipProps) {
  const x = xScale(point.timestamp) ?? 0;
  const y = yScale(point.price) ?? 0;

  const boxWidth = 128;
  const boxHeight = 40;
  const offset = 12;
  const left =
    x + offset + boxWidth > innerWidth
      ? innerWidth - boxWidth - offset
      : x + offset;
  const top = Math.max(0, y - boxHeight - 8);

  const timeLabel = point.timestamp.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <g
      className="tooltip"
      pointerEvents="none"
      transform={`translate(${left}, ${top})`}
    >
      <rect
        width={boxWidth}
        height={boxHeight}
        rx={4}
        className="tooltip-box"
      />
      <text x={8} y={16} className="tooltip-text">
        {timeLabel}
      </text>
      <text x={8} y={32} className="tooltip-text">
        ${formatPrice(point.price)}
      </text>
    </g>
  );
}
