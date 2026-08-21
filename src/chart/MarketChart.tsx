import * as d3 from "d3";
import { useState, useEffect, useMemo, useRef } from "react";

import type { MarketPoint } from "@/data";
import {
  createXScale,
  findNearestByTime,
  getInnerSize,
  getPriceDomain,
  getVolumeDomain,
  getXDomain,
  getVisibleWindow,
} from "@/chart-core";
import { PRICE_MARGINS, VOLUME_MARGINS } from "@/features/ChartEngineLab";
import { buildSharedViewport, buildPanelViewport } from "@/chart-core/viewport";

import { ChartSurface } from "./ChartSurface";
import { Crosshair } from "./Crosshair";
import { Tooltip } from "./Tooltip";
import { XAxis } from "./XAxis";
import { YAxis } from "./YAxis";
import { PriceSeries } from "./PriceSeries";
import { VolumeSeries } from "./VolumeSeries";
import { useContainerSize } from "./useContainerSize";
import { useChartZoom } from "./useChartZoom";

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

  const pricePlotSize = useMemo(() => {
    const margins = PRICE_MARGINS;
    const height = PRICE_HEIGHT;
    return {
      ...getInnerSize(width, height, margins),
      width,
      height,
      margins,
    };
  }, [width]);

  const volumePlotSize = useMemo(() => {
    const margins = VOLUME_MARGINS;
    const height = VOLUME_HEIGHT;
    return {
      ...getInnerSize(width, height, margins),
      width,
      height,
      margins,
    };
  }, [width]);

  const baseXScale = useMemo(() => {
    return createXScale(getXDomain(points), [0, pricePlotSize.innerWidth]);
  }, [points, pricePlotSize.innerWidth]);

  const { zoomRef, xDomain } = useChartZoom({
    baseXScale: baseXScale,
    innerWidth: pricePlotSize.innerWidth,
    innerHeight: pricePlotSize.innerHeight,
  });

  const visibleWindow = useMemo(() => {
    return getVisibleWindow(points, xDomain ?? getXDomain(points));
  }, [points, xDomain]);

  const sharedViewport = useMemo(() => {
    return buildSharedViewport({
      points,
      innerWidth: pricePlotSize.innerWidth,
      xDomain,
    });
  }, [points, pricePlotSize.innerWidth, xDomain]);

  const priceViewport = useMemo(() => {
    return buildPanelViewport({
      shared: sharedViewport,
      points,
      visible: visibleWindow,
      size: pricePlotSize,
      getYDomain: getPriceDomain,
    });
  }, [sharedViewport, visibleWindow, points, pricePlotSize]);

  const volumeViewport = useMemo(() => {
    return buildPanelViewport({
      shared: sharedViewport,
      points,
      visible: visibleWindow,
      size: volumePlotSize,
      getYDomain: getVolumeDomain,
    });
  }, [sharedViewport, visibleWindow, points, volumePlotSize]);

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

      const time = sharedViewport.xScale.invert(pointerX);
      setHoverPoint(findNearestByTime(points, time));
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
        <ChartSurface
          width={priceViewport.size.width}
          height={priceViewport.size.height}
        >
          <defs>
            <clipPath id="plot-clip">
              <rect
                width={priceViewport.size.innerWidth}
                height={priceViewport.size.innerHeight}
              />
            </clipPath>
          </defs>
          <g
            transform={`translate(${priceViewport.size.margins.left}, ${priceViewport.size.margins.top})`}
          >
            <XAxis
              xScale={priceViewport.xScale}
              innerHeight={priceViewport.size.innerHeight}
            />
            <YAxis yScale={priceViewport.yScale} />

            <g clipPath="url(#plot-clip)">
              <PriceSeries
                points={priceViewport.visible}
                xScale={priceViewport.xScale}
                yScale={priceViewport.yScale}
              />
            </g>

            <g ref={zoomRef}>
              <rect
                width={priceViewport.size.innerWidth}
                height={priceViewport.size.innerHeight}
                fill="transparent"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              />
            </g>
            {hoverPoint && (
              <>
                <Crosshair
                  point={hoverPoint}
                  xScale={priceViewport.xScale}
                  yScale={priceViewport.yScale}
                  innerHeight={priceViewport.size.innerHeight}
                />
                <Tooltip
                  point={hoverPoint}
                  xScale={priceViewport.xScale}
                  yScale={priceViewport.yScale}
                  innerWidth={priceViewport.size.innerWidth}
                />
              </>
            )}
          </g>
        </ChartSurface>
      </div>
      <div className="chart-pane chart-pane--volume">
        <ChartSurface
          width={volumeViewport.size.width}
          height={volumeViewport.size.height}
        >
          <defs>
            <clipPath id="volume-clip">
              <rect
                width={volumeViewport.size.innerWidth}
                height={volumeViewport.size.innerHeight}
              />
            </clipPath>
          </defs>
          <g
            transform={`translate(${volumeViewport.size.margins.left}, ${volumeViewport.size.margins.top})`}
          >
            <VolumeSeries
              points={volumeViewport.visible}
              xScale={volumeViewport.xScale}
              yScale={volumeViewport.yScale}
            />
            <XAxis
              xScale={volumeViewport.xScale}
              innerHeight={volumeViewport.size.innerHeight}
            />
            {hoverPoint && (
              <Crosshair
                point={hoverPoint}
                xScale={volumeViewport.xScale}
                yScale={volumeViewport.yScale}
                innerHeight={volumeViewport.size.innerHeight}
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
