import * as d3 from "d3";
import { useState, useMemo, useRef } from "react";
import { ChartSurface } from "./ChartSurface";
import { Crosshair } from "./Crosshair";
import { Tooltip } from "./Tooltip";
import { XAxis } from "./XAxis";
import { YAxis } from "./YAxis";
import { PriceSeries } from "./PriceSeries";
import { useContainerSize } from "./useContainerSize";
import { findNearestPoint } from "./nearestPoint";
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
  const [hoverPoint, setHoverPoint] = useState<MarketPoint | null>(null);

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

  const { margins, innerWidth, innerHeight, xScale, yScale } = layout;

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    const [pointerX] = d3.pointer(event);
    const time = xScale.invert(pointerX);
    setHoverPoint(findNearestPoint(points, time));
  }

  function handlePointerLeave() {
    setHoverPoint(null);
  }

  return (
    <div className="market-chart" ref={containerRef}>
      <div className="chart-pane chart-pane--price">
        <ChartSurface width={width} height={PRICE_HEIGHT}>
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <XAxis xScale={xScale} innerHeight={innerHeight} />
            <YAxis yScale={yScale} />
            <PriceSeries points={points} xScale={xScale} yScale={yScale} />

            <rect
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            />
            {hoverPoint && (
              <>
                <Crosshair
                  point={hoverPoint}
                  xScale={xScale}
                  yScale={yScale}
                  innerHeight={innerHeight}
                />
                <Tooltip
                  point={hoverPoint}
                  xScale={xScale}
                  yScale={yScale}
                  innerWidth={innerWidth}
                />
              </>
            )}
          </g>
        </ChartSurface>
      </div>
      <div className="chart-pane chart-pane--volume">
        <ChartSurface width={width} height={VOLUME_HEIGHT} />
      </div>
    </div>
  );
}
