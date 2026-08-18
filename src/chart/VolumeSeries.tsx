import { useMemo } from "react";
import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "../data/types";

type VolumeSeriesProps = {
  points: MarketPoint[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
};

/**
 * Single-path bars: every visible volume is drawn, but as one SVG node
 * (same idea as PriceSeries — geometry in a string, not thousands of elements).
 */
export const VolumeSeries = ({ points, xScale, yScale }: VolumeSeriesProps) => {
  const pathD = useMemo(() => {
    if (points.length === 0) return "";

    const domain = xScale.domain() as [Date, Date];
    const visible = points.filter(
      (d) => d.timestamp >= domain[0] && d.timestamp <= domain[1],
    );

    if (visible.length === 0) return "";

    const innerHeight = yScale.range()[0];
    const [rangeStart, rangeEnd] = xScale.range();
    const plotWidth = rangeEnd - rangeStart;

    const barWidth =
      visible.length > 1
        ? Math.max(1, plotWidth / (visible.length - 1))
        : Math.max(1, plotWidth);

    // Build one compound path: each bar is a closed rectangle subpath.
    let d = "";
    for (const point of visible) {
      const x = xScale(point.timestamp) ?? 0;
      const y = yScale(point.volume) ?? innerHeight;
      const x0 = x - barWidth / 2;
      const x1 = x0 + barWidth;
      const y0 = innerHeight;
      const y1 = y;

      d += `M${x0} ${y0}L${x0} ${y1}L${x1} ${y1}L${x1} ${y0}Z`;
    }

    return d;
  }, [points, xScale, yScale]);

  return <path className="volume-series" d={pathD} fill="currentColor" />;
};
