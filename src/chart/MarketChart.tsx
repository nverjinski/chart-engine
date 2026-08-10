import * as d3 from "d3";
import { useState, useEffect, useMemo, useRef } from "react";
import { ChartSurface } from "./ChartSurface";
import { Crosshair } from "./Crosshair";
import { Tooltip } from "./Tooltip";
import { XAxis } from "./XAxis";
import { YAxis } from "./YAxis";
import { PriceSeries } from "./PriceSeries";
import { VolumeSeries } from "./VolumeSeries";
import { useContainerSize } from "./useContainerSize";
import { findNearestPoint } from "./nearestPoint";
import {
  PRICE_MARGINS,
  VOLUME_MARGINS,
  getInnerSize,
  createXScale,
  createYScaleForDomain,
  createVolumeScale,
} from "./scales";
import { useChartZoom } from "./useChartZoom";
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
  const frameRef = useRef<number | null>(null);
  const pointerXRef = useRef<number | null>(null);
  const { width } = useContainerSize(containerRef);

  const layout = useMemo(() => {
    const margins = PRICE_MARGINS;
    const { innerWidth, innerHeight } = getInnerSize(
      width,
      PRICE_HEIGHT,
      margins,
    );
    const baseXScale = createXScale(points, innerWidth);
    return {
      margins,
      innerWidth,
      innerHeight,
      baseXScale,
    };
  }, [points, width]);

  const volumeLayout = useMemo(() => {
    const margins = VOLUME_MARGINS;
    const { innerWidth, innerHeight } = getInnerSize(
      width,
      VOLUME_HEIGHT,
      margins,
    );
    return {
      margins,
      innerWidth,
      innerHeight,
    };
  }, [width]);

  const { margins, innerWidth, innerHeight, baseXScale } = layout;

  const { zoomRef, xDomain } = useChartZoom({
    baseXScale: baseXScale,
    innerWidth: innerWidth,
    innerHeight: innerHeight,
  });

  const xScale = useMemo(() => {
    const scale = baseXScale.copy();
    if (xDomain) scale.domain(xDomain);
    return scale;
  }, [baseXScale, xDomain]);

  const yScale = useMemo(() => {
    const domain = (xDomain ?? baseXScale.domain()) as [Date, Date];
    const visible = points.filter(
      (d) => d.timestamp >= domain[0] && d.timestamp <= domain[1],
    );
    return createYScaleForDomain(visible, domain, innerHeight);
  }, [points, xDomain, baseXScale, innerHeight]);

  const yVolumeScale = useMemo(() => {
    const domain = (xDomain ?? baseXScale.domain()) as [Date, Date];
    const visible = points.filter(
      (d) => d.timestamp >= domain[0] && d.timestamp <= domain[1],
    );
    return createVolumeScale(visible, volumeLayout.innerHeight);
  }, [xDomain, baseXScale, points, volumeLayout.innerHeight]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    pointerXRef.current = d3.pointer(event)[0];

    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pointerX = pointerXRef.current;

      if (pointerX === null) return;

      const time = xScale.invert(pointerX);
      setHoverPoint(findNearestPoint(points, time));
    });
  }

  function handlePointerLeave() {
    pointerXRef.current = null;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setHoverPoint(null);
  }

  return (
    <div className="market-chart" ref={containerRef}>
      <div className="chart-pane chart-pane--price">
        <ChartSurface width={width} height={PRICE_HEIGHT}>
          <defs>
            <clipPath id="plot-clip">
              <rect width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <XAxis xScale={xScale} innerHeight={innerHeight} />
            <YAxis yScale={yScale} />

            <g clipPath="url(#plot-clip)">
              <PriceSeries points={points} xScale={xScale} yScale={yScale} />
            </g>

            <g ref={zoomRef}>
              <rect
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              />
            </g>
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
        <ChartSurface width={width} height={VOLUME_HEIGHT}>
          <defs>
            <clipPath id="volume-clip">
              <rect width={innerWidth} height={volumeLayout.innerHeight} />
            </clipPath>
          </defs>
          <g
            transform={`translate(${volumeLayout.margins.left}, ${volumeLayout.margins.top})`}
          >
            <VolumeSeries
              points={points}
              xScale={xScale}
              yScale={yVolumeScale}
            />
            <XAxis xScale={xScale} innerHeight={volumeLayout.innerHeight} />
            {hoverPoint && (
              <Crosshair
                point={hoverPoint}
                xScale={xScale}
                yScale={yVolumeScale}
                innerHeight={volumeLayout.innerHeight}
                verticalOnly={true}
              />
            )}
          </g>
        </ChartSurface>
      </div>
    </div>
  );
}

/*

*/
