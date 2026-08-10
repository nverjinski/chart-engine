import { useMemo } from "react";
import type { ScaleLinear, ScaleTime } from "d3";
import type { MarketPoint } from "../data/types";

type VolumeSeriesProps = {
  points: MarketPoint[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
};

/*
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
*/

/*
 * Pixel-budget downsample: fewer DOM nodes, but skips many volumes.
 *
export const VolumeSeries = ({ points, xScale, yScale }: VolumeSeriesProps) => {
  const bars = useMemo(() => {
    if (points.length === 0) return [];

    const domain = xScale.domain() as [Date, Date];

    const visible = points.filter(
      (d) => d.timestamp >= domain[0] && d.timestamp <= domain[1],
    );

    if (visible.length === 0) return [];

    const MIN_GAP_PX = 2;
    const sampled: MarketPoint[] = [];
    let lastX = -Infinity;

    for (const d of visible) {
      const x = xScale(d.timestamp) ?? 0;

      if (x - lastX >= MIN_GAP_PX) {
        sampled.push(d);
        lastX = x;
      }
    }

    const innerHeight = yScale.range()[0];
    const [x0, x1] = xScale.range();
    const plotWidth = x1 - x0;

    const barWidth =
      sampled.length > 1
        ? Math.max(1, plotWidth / sampled.length)
        : Math.max(1, plotWidth);

    return sampled.map((d) => {
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
    <g>
      {bars.map((bar) => (
        <rect
          key={bar.key}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
        />
      ))}
    </g>
  );
};
*/

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

  return (
    <path className="volume-series" d={pathD} fill="currentColor" />
  );
};
