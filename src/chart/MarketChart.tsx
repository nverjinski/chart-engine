import { useMemo, useRef } from "react";
import { ChartSurface } from "./ChartSurface";
import { XAxis } from "./XAxis";
import { YAxis } from "./YAxis";
import { useContainerSize } from "./useContainerSize";
import {
  PRICE_MARGINS,
  getInnerSize,
  createXScale,
  createYScale,
} from "./scales";
import type { MarketPoint } from "../data/types";

const PRICE_HEIGHT = 480;
const VOLUME_HEIGHT = 120;

type MarketChartProps = {
  points: MarketPoint[];
};

/**
 * Top-level chart composition.
 */
export function MarketChart({ points }: MarketChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerSize(containerRef);

  const layout = useMemo(() => {
    const margins = PRICE_MARGINS;
    const { innerWidth, innerHeight } = getInnerSize(
      width,
      PRICE_HEIGHT,
      margins,
    );
    const xScale = createXScale(points, innerWidth);
    const yScale = createYScale(points, innerHeight);
    return {
      margins,
      innerWidth,
      innerHeight,
      xScale,
      yScale,
    };
  }, [points, width]);

  const { margins, innerHeight, xScale, yScale } = layout;

  return (
    <div className="market-chart" ref={containerRef}>
      <div className="chart-pane chart-pane--price">
        <ChartSurface width={width} height={PRICE_HEIGHT}>
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <XAxis xScale={xScale} innerHeight={innerHeight} />
            <YAxis yScale={yScale} />
          </g>
        </ChartSurface>
      </div>
      <div className="chart-pane chart-pane--volume">
        <ChartSurface width={width} height={VOLUME_HEIGHT} />
      </div>
    </div>
  );
}
