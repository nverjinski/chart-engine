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
import {
  PRICE_MARGINS,
  PRICE_HEIGHT,
  VOLUME_MARGINS,
  VOLUME_HEIGHT,
  PricePanel,
  VolumePanel,
} from "./panels";
import { buildSharedViewport, buildPanelViewport } from "@/chart-core/viewport";

import { useContainerSize, useChartZoom, ChartProvider } from "@/chart-react";

type MarketChartProps = {
  points: MarketPoint[];
};

/**
 * Top-level chart composition.
 */
export function MarketChart({ points }: MarketChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<MarketPoint | null>(null);

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
      points: visibleWindow.slice,
      size: pricePlotSize,
      getYDomain: getPriceDomain,
    });
  }, [sharedViewport, visibleWindow, pricePlotSize]);

  const volumeViewport = useMemo(() => {
    return buildPanelViewport({
      shared: sharedViewport,
      points: visibleWindow.slice,
      size: volumePlotSize,
      getYDomain: getVolumeDomain,
    });
  }, [sharedViewport, visibleWindow, volumePlotSize]);

  const chartContextValue = useMemo(() => {
    return {
      visiblePoints: visibleWindow.slice,
      selectedPoint: selectedPoint,
      priceViewport,
      volumeViewport,
    };
  }, [visibleWindow, selectedPoint, priceViewport, volumeViewport]);

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
      setSelectedPoint(findNearestByTime(points, time));
    });
  }

  function handlePointerLeave() {
    pointerXRef.current = null;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setSelectedPoint(null);
  }

  return (
    <div className="market-chart" ref={containerRef}>
      <ChartProvider value={chartContextValue}>
        <PricePanel
          zoomRef={zoomRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />
        <VolumePanel />
      </ChartProvider>
    </div>
  );
}

/*

*/
