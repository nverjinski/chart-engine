import type { ScaleLinear } from "d3";
import { formatPrice } from "../chart-core/formatting/formatPrice";

type YAxisProps = {
  yScale: ScaleLinear<number, number>;
};

export function YAxis({ yScale }: YAxisProps) {
  const ticks = yScale.ticks(6);

  return (
    <g className="axis axis-y">
      <line
        y1={yScale.range()[0]}
        y2={yScale.range()[1]}
        stroke="currentColor"
      />
      {ticks.map((tick) => {
        const y = yScale(tick) ?? 0;
        return (
          <g key={tick} transform={`translate(0, ${y})`}>
            <line x2={6} stroke="currentColor" />
            <text
              x={-10}
              dy="0.32em"
              textAnchor="end"
              fill="currentColor"
              fontSize={11}
            >
              {formatPrice(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
