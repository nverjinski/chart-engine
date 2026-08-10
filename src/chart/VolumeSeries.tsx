import { useMemo } from "react";
import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "../data/types";

type VolumeSeriesProps = {
  points: MarketPoint[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
};

export const VolumeSeries = ({ points, xScale, yScale }: VolumeSeriesProps) => {
  const bars = useMemo(() => {
    if (points.length === 0) return [];

    const domain = xScale.domain() as [Date, Date];
    const visible = points.filter(
      (d) => d.timestamp >= domain[0] && d.timestamp <= domain[1],
    );
    const innerHeight = yScale.range()[0];
    const [x0, x1] = xScale.range();
    const plotWidth = x1 - x0;

    // Approximate bar width from point spacing in screen space
    const barWidth = Math.max(1, plotWidth / (visible.length - 1));

    return visible.map((d) => {
      const x = xScale(d.timestamp) ?? 0;
      const y = yScale(d.volume) ?? 0;
      return {
        key: d.timestamp.toISOString(),
        x: x - barWidth / 2,
        y,
        width: barWidth,
        height: Math.max(0, innerHeight - y),
      };
    });
  }, [points, xScale, yScale]);

  return (
    <g className="volume-series">
      {bars.map((bar) => {
        return (
          <rect
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill="currentColor"
          />
        );
      })}
    </g>
  );
};
